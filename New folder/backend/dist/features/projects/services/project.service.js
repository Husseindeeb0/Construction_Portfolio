import prisma from '../../../configs/prisma.js';
import { uploadImage, deleteImage } from '../../../externalProviders/imagekit/services/imagekit.service.js';
import { recordPendingDeletion, removePendingDeletion } from '../../../externalProviders/imagekit/services/pendingImageDeletion.service.js';
import { NotFoundError, ConflictError, BadRequestError } from '../../../utils/errors.js';
// --- Response Mappers ---
const mapProjectCategoryResponse = (category) => {
    return {
        id: category.id,
        name: category.name,
        displayOrder: category.displayOrder,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
    };
};
const mapProjectResponse = (project) => {
    return {
        id: project.id,
        title: project.title,
        description: project.description,
        imageUrl: project.imageUrl,
        displayOrder: project.displayOrder,
        isActive: project.isActive,
        projectCategoryId: project.projectCategoryId,
        category: project.category
            ? {
                id: project.category.id,
                name: project.category.name,
                displayOrder: project.category.displayOrder
            }
            : undefined,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt
    };
};
// ─────────────────────────────────────────────────────────────────────────────
// Project Category Services
// ─────────────────────────────────────────────────────────────────────────────
export const getProjectCategoriesService = async () => {
    const categories = await prisma.projectCategory.findMany({
        orderBy: {
            displayOrder: 'asc'
        }
    });
    return categories.map(mapProjectCategoryResponse);
};
export const createProjectCategoryService = async (dto) => {
    // Check for unique name conflict
    const existing = await prisma.projectCategory.findUnique({
        where: { name: dto.name }
    });
    if (existing) {
        throw new ConflictError(`Project category with name "${dto.name}" already exists`);
    }
    const category = await prisma.projectCategory.create({
        data: {
            name: dto.name,
            displayOrder: dto.displayOrder
        }
    });
    return mapProjectCategoryResponse(category);
};
export const updateProjectCategoryService = async (id, dto) => {
    const existing = await prisma.projectCategory.findUnique({
        where: { id }
    });
    if (!existing) {
        throw new NotFoundError(`Project category with ID ${id} not found`);
    }
    if (dto.name && dto.name !== existing.name) {
        const duplicate = await prisma.projectCategory.findUnique({
            where: { name: dto.name }
        });
        if (duplicate) {
            throw new ConflictError(`Project category with name "${dto.name}" already exists`);
        }
    }
    const updated = await prisma.projectCategory.update({
        where: { id },
        data: {
            name: dto.name ?? existing.name,
            displayOrder: dto.displayOrder ?? existing.displayOrder
        }
    });
    return mapProjectCategoryResponse(updated);
};
export const deleteProjectCategoryService = async (id) => {
    const existing = await prisma.projectCategory.findUnique({
        where: { id },
        include: {
            projects: {
                select: { id: true }
            }
        }
    });
    if (!existing) {
        throw new NotFoundError(`Project category with ID ${id} not found`);
    }
    if (existing.projects && existing.projects.length > 0) {
        throw new BadRequestError(`Cannot delete category "${existing.name}" because ${existing.projects.length} project(s) still reference it`);
    }
    await prisma.projectCategory.delete({
        where: { id }
    });
};
// ─────────────────────────────────────────────────────────────────────────────
// Project Services
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Retrieves projects.
 * If publicRequest is true, filters by isActive: true.
 * If false (e.g. admin view), returns all projects.
 */
export const getProjectsService = async (publicRequest = false) => {
    const projects = await prisma.project.findMany({
        where: publicRequest ? { isActive: true } : undefined,
        include: {
            category: true
        },
        orderBy: {
            displayOrder: 'asc'
        }
    });
    return projects.map(mapProjectResponse);
};
export const getProjectByIdService = async (id) => {
    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            category: true
        }
    });
    if (!project) {
        throw new NotFoundError(`Project with ID ${id} not found`);
    }
    return mapProjectResponse(project);
};
/**
 * Creates a project with required image upload and shared pending-deletion workflow.
 */
export const createProjectService = async (dto) => {
    // Validate that the referenced category exists
    const category = await prisma.projectCategory.findUnique({
        where: { id: dto.projectCategoryId }
    });
    if (!category) {
        throw new NotFoundError(`Project category with ID ${dto.projectCategoryId} not found`);
    }
    // 1. Upload image to ImageKit
    const uploadResult = await uploadImage({
        file: dto.image.file,
        fileName: dto.image.fileName,
        folder: '/projects'
    });
    const uploadedImage = {
        url: uploadResult.url,
        fileId: uploadResult.fileId
    };
    // 2. Pre-record the uploaded image in pending deletion table before starting DB insertion
    try {
        await recordPendingDeletion(uploadedImage.fileId);
    }
    catch (err) {
        console.error(`Failed to pre-record pending deletion for project image (${uploadedImage.fileId}):`, err);
    }
    try {
        // 3. Atomically create project and remove the pending record in the same transaction
        const project = await prisma.$transaction(async (tx) => {
            const created = await tx.project.create({
                data: {
                    title: dto.title,
                    description: dto.description,
                    imageUrl: uploadedImage.url,
                    imageId: uploadedImage.fileId,
                    displayOrder: dto.displayOrder,
                    isActive: dto.isActive !== undefined ? dto.isActive : true,
                    projectCategoryId: dto.projectCategoryId
                },
                include: {
                    category: true
                }
            });
            // Remove the pending record transactionally once successfully referenced
            await removePendingDeletion(uploadedImage.fileId, tx);
            return created;
        });
        return mapProjectResponse(project);
    }
    catch (dbError) {
        // If DB transaction fails:
        // The pre-recorded pending record remains intact in the database for the background job to clean up!
        // Attempt immediate opportunistic cleanup as well:
        try {
            const isDeleted = await deleteImage(uploadedImage.fileId);
            if (isDeleted) {
                await removePendingDeletion(uploadedImage.fileId);
            }
        }
        catch (cleanupError) {
            console.error(`Immediate cleanup failed for project image (${uploadedImage.fileId}), remaining in pending table:`, cleanupError);
        }
        throw dbError;
    }
};
/**
 * Updates a project with optional replacement image and shared pending-deletion workflow.
 */
export const updateProjectService = async (id, dto) => {
    const existing = await prisma.project.findUnique({
        where: { id }
    });
    if (!existing) {
        throw new NotFoundError(`Project with ID ${id} not found`);
    }
    // Validate category if updating category ID
    if (dto.projectCategoryId && dto.projectCategoryId !== existing.projectCategoryId) {
        const category = await prisma.projectCategory.findUnique({
            where: { id: dto.projectCategoryId }
        });
        if (!category) {
            throw new NotFoundError(`Project category with ID ${dto.projectCategoryId} not found`);
        }
    }
    let newlyUploadedImage = null;
    // If a replacement image is provided:
    if (dto.image) {
        const uploadResult = await uploadImage({
            file: dto.image.file,
            fileName: dto.image.fileName,
            folder: '/projects'
        });
        newlyUploadedImage = {
            url: uploadResult.url,
            fileId: uploadResult.fileId
        };
        // Pre-record the replacement image in pending deletion table
        try {
            await recordPendingDeletion(newlyUploadedImage.fileId);
        }
        catch (err) {
            console.error(`Failed to pre-record pending deletion for new project image (${newlyUploadedImage.fileId}):`, err);
        }
    }
    const targetImageUrl = newlyUploadedImage ? newlyUploadedImage.url : existing.imageUrl;
    const targetImageId = newlyUploadedImage ? newlyUploadedImage.fileId : existing.imageId;
    const oldFileIdToDelete = newlyUploadedImage ? existing.imageId : null;
    try {
        const updated = await prisma.$transaction(async (tx) => {
            const project = await tx.project.update({
                where: { id },
                data: {
                    title: dto.title ?? existing.title,
                    description: dto.description ?? existing.description,
                    displayOrder: dto.displayOrder ?? existing.displayOrder,
                    isActive: dto.isActive !== undefined ? dto.isActive : existing.isActive,
                    projectCategoryId: dto.projectCategoryId ?? existing.projectCategoryId,
                    imageUrl: targetImageUrl,
                    imageId: targetImageId
                },
                include: {
                    category: true
                }
            });
            // If replacing image:
            if (newlyUploadedImage) {
                // 1. Record old image for deletion within the same transaction
                if (oldFileIdToDelete) {
                    await recordPendingDeletion(oldFileIdToDelete, tx);
                }
                // 2. Remove the newly uploaded image from pending deletion within the same transaction
                await removePendingDeletion(newlyUploadedImage.fileId, tx);
            }
            return project;
        });
        // After transaction commits, attempt immediate external deletion of the old image
        if (oldFileIdToDelete) {
            try {
                const isDeleted = await deleteImage(oldFileIdToDelete);
                if (isDeleted) {
                    await removePendingDeletion(oldFileIdToDelete);
                }
            }
            catch (err) {
                console.error(`Immediate deletion failed for old project image (${oldFileIdToDelete}), background job will retry:`, err);
            }
        }
        return mapProjectResponse(updated);
    }
    catch (dbError) {
        // If DB transaction fails:
        // The newly uploaded image's pre-recorded pending deletion record remains in the table.
        // Attempt immediate opportunistic deletion of the newly uploaded image:
        if (newlyUploadedImage?.fileId) {
            try {
                const isDeleted = await deleteImage(newlyUploadedImage.fileId);
                if (isDeleted) {
                    await removePendingDeletion(newlyUploadedImage.fileId);
                }
            }
            catch (cleanupError) {
                console.error(`Immediate cleanup failed for replacement project image (${newlyUploadedImage.fileId}), remaining in pending table:`, cleanupError);
            }
        }
        throw dbError;
    }
};
/**
 * Deletes a project and handles image deletion via atomic transaction + pending record.
 */
export const deleteProjectService = async (id) => {
    const existing = await prisma.project.findUnique({
        where: { id }
    });
    if (!existing) {
        throw new NotFoundError(`Project with ID ${id} not found`);
    }
    const fileIdToDelete = existing.imageId;
    // Transaction: atomically insert pending deletion record and delete the project
    await prisma.$transaction(async (tx) => {
        if (fileIdToDelete) {
            await recordPendingDeletion(fileIdToDelete, tx);
        }
        await tx.project.delete({
            where: { id }
        });
    });
    // After transaction commits, attempt external ImageKit deletion
    if (fileIdToDelete) {
        try {
            const isDeleted = await deleteImage(fileIdToDelete);
            if (isDeleted) {
                await removePendingDeletion(fileIdToDelete);
            }
        }
        catch (err) {
            console.error(`Immediate deletion failed for deleted project image (${fileIdToDelete}), background job will retry:`, err);
        }
    }
};
