import prisma from "../../../configs/prisma.js";
import { CreateProjectRequestDto } from "../dtos/requests/createProject.dto.js";
import { UpdateProjectRequestDto } from "../dtos/requests/updateProject.dto.js";
import { ProjectResponseDto } from "../dtos/responses/projectResponse.dto.js";
import {
  uploadImage,
  deleteImage,
} from "../../../externalProviders/imagekit/services/imagekit.service.js";
import {
  recordPendingDeletion,
  removePendingDeletion,
} from "../../../externalProviders/imagekit/services/pendingImageDeletion.service.js";
import { NotFoundError } from "../../../utils/errors.js";
import { reorderItemHelper } from "../../../utils/reorder/reorder.utils.js";
import { ReorderDirection } from "../../../utils/reorder/reorder.dto.js";
import { Project, ProjectCategory } from "@prisma/client";

type ProjectWithCategory = Project & {
  category?: ProjectCategory;
};

const mapProjectResponse = (
  project: ProjectWithCategory,
): ProjectResponseDto => {
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
          displayOrder: project.category.displayOrder,
        }
      : undefined,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
};

export interface GetProjectsOptions {
  publicRequest?: boolean
  categoryId?: number
  skip?: number
  take?: number
  page?: number
}

export interface PaginatedProjectsResult {
  projects: ProjectResponseDto[]
  totalItems: number
  currentPage: number
  totalPages: number
  pageSize: number
}

export const getProjectsService = async (
  options: boolean | GetProjectsOptions = false,
): Promise<PaginatedProjectsResult> => {
  const isPublic = typeof options === 'boolean' ? options : !!options.publicRequest
  const categoryId = typeof options === 'object' ? options.categoryId : undefined
  const skip = typeof options === 'object' ? options.skip : undefined
  const take = typeof options === 'object' ? options.take : undefined
  const page = typeof options === 'object' && options.page ? options.page : 1

  const where: any = {}
  if (isPublic) {
    where.isActive = true
  }
  if (categoryId) {
    where.projectCategoryId = categoryId
  }

  const [totalItems, projects] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        displayOrder: "asc",
      },
      skip,
      take,
    }),
  ])

  const pageSize = take ?? totalItems
  const totalPages = pageSize > 0 ? Math.ceil(totalItems / pageSize) : 1

  return {
    projects: projects.map(mapProjectResponse),
    totalItems,
    currentPage: page,
    totalPages,
    pageSize,
  }
};


export const getProjectByIdService = async (
  id: number,
): Promise<ProjectResponseDto> => {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });

  if (!project) {
    throw new NotFoundError(`Project with ID ${id} not found`);
  }

  return mapProjectResponse(project);
};

export const createProjectService = async (
  dto: CreateProjectRequestDto,
): Promise<ProjectResponseDto> => {
  const category = await prisma.projectCategory.findUnique({
    where: { id: dto.projectCategoryId },
  });

  if (!category) {
    throw new NotFoundError(
      `Project category with ID ${dto.projectCategoryId} not found`,
    );
  }

  // Calculate initial position: max(displayOrder) + 1, starting at 1
  const maxProject = await prisma.project.findFirst({
    orderBy: { displayOrder: "desc" },
    select: { displayOrder: true },
  });
  const initialDisplayOrder = (maxProject?.displayOrder ?? 0) + 1;

  // Upload image to ImageKit
  const uploadResult = await uploadImage({
    file: dto.image.file,
    fileName: dto.image.fileName,
    folder: "/projects",
  });

  const uploadedImage = {
    url: uploadResult.url,
    fileId: uploadResult.fileId,
  };

  try {
    const project = await prisma.project.create({
      data: {
        title: dto.title,
        description: dto.description,
        imageUrl: uploadedImage.url,
        imageId: uploadedImage.fileId,
        displayOrder: initialDisplayOrder,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
        projectCategoryId: dto.projectCategoryId,
      },
      include: {
        category: true,
      },
    });

    return mapProjectResponse(project);
  } catch (dbError) {
    // If DB creation fails, attempt immediate cleanup;
    // if cleanup fails or errors, ensure pending deletion is scheduled
    try {
      const isDeleted = await deleteImage(uploadedImage.fileId);
      if (!isDeleted) {
        await recordPendingDeletion(uploadedImage.fileId);
      }
    } catch (cleanupError) {
      console.error(
        `Immediate cleanup error for uploaded project image (${uploadedImage.fileId}):`,
        cleanupError,
      );
      try {
        await recordPendingDeletion(uploadedImage.fileId);
      } catch (scheduleError) {
        console.error(
          `Failed to schedule pending deletion for uploaded project image (${uploadedImage.fileId}):`,
          scheduleError,
        );
      }
    }
    throw dbError;
  }
};

export const updateProjectService = async (
  id: number,
  dto: UpdateProjectRequestDto,
): Promise<ProjectResponseDto> => {
  const existing = await prisma.project.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundError(`Project with ID ${id} not found`);
  }

  // Validate category if updating category ID
  if (
    dto.projectCategoryId &&
    dto.projectCategoryId !== existing.projectCategoryId
  ) {
    const category = await prisma.projectCategory.findUnique({
      where: { id: dto.projectCategoryId },
    });
    if (!category) {
      throw new NotFoundError(
        `Project category with ID ${dto.projectCategoryId} not found`,
      );
    }
  }

  let newlyUploadedImage: { url: string; fileId: string } | null = null;

  // If a replacement image is provided, upload it first
  if (dto.image) {
    const uploadResult = await uploadImage({
      file: dto.image.file,
      fileName: dto.image.fileName,
      folder: "/projects",
    });
    newlyUploadedImage = {
      url: uploadResult.url,
      fileId: uploadResult.fileId,
    };
  }

  const targetImageUrl = newlyUploadedImage
    ? newlyUploadedImage.url
    : existing.imageUrl;
  const targetImageId = newlyUploadedImage
    ? newlyUploadedImage.fileId
    : existing.imageId;
  const oldFileIdToDelete = newlyUploadedImage ? existing.imageId : null;

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const project = await tx.project.update({
        where: { id },
        data: {
          title: dto.title ?? existing.title,
          description: dto.description ?? existing.description,
          isActive:
            dto.isActive !== undefined ? dto.isActive : existing.isActive,
          projectCategoryId:
            dto.projectCategoryId ?? existing.projectCategoryId,
          imageUrl: targetImageUrl,
          imageId: targetImageId,
        },
        include: {
          category: true,
        },
      });

      // Atomically record old image pending deletion
      if (oldFileIdToDelete) {
        await recordPendingDeletion(oldFileIdToDelete, tx);
      }

      return project;
    });

    // After transaction commits, attempt external ImageKit deletion
    if (oldFileIdToDelete) {
      const isDeleted = await deleteImage(oldFileIdToDelete);
      if (isDeleted) {
        await removePendingDeletion(oldFileIdToDelete);
      }
    }

    return mapProjectResponse(updated);
  } catch (dbError) {
    // If DB transaction fails, clean up the newly uploaded replacement image
    if (newlyUploadedImage?.fileId) {
      try {
        const isDeleted = await deleteImage(newlyUploadedImage.fileId);
        if (!isDeleted) {
          await recordPendingDeletion(newlyUploadedImage.fileId);
        }
      } catch (cleanupError) {
        console.error(
          `Immediate cleanup error for replacement project image (${newlyUploadedImage.fileId}):`,
          cleanupError,
        );
        try {
          await recordPendingDeletion(newlyUploadedImage.fileId);
        } catch (scheduleError) {
          console.error(
            `Failed to schedule pending deletion for replacement project image (${newlyUploadedImage.fileId}):`,
            scheduleError,
          );
        }
      }
    }
    throw dbError;
  }
};

export const reorderProjectService = async (
  id: number,
  direction: ReorderDirection,
): Promise<void> => {
  await reorderItemHelper(id, direction, {
    notFoundMessage: `Project with ID ${id} not found`,
    findTarget: async (tx, itemId) => {
      return await tx.project.findUnique({
        where: { id: itemId },
        select: { id: true, displayOrder: true },
      });
    },
    findAdjacent: async (tx, target, dir) => {
      if (dir === "up") {
        return await tx.project.findFirst({
          where: { displayOrder: { lt: target.displayOrder } },
          orderBy: { displayOrder: "desc" },
          select: { id: true, displayOrder: true },
        });
      } else {
        return await tx.project.findFirst({
          where: { displayOrder: { gt: target.displayOrder } },
          orderBy: { displayOrder: "asc" },
          select: { id: true, displayOrder: true },
        });
      }
    },
    updateOrder: async (tx, itemId, newOrder) => {
      await tx.project.update({
        where: { id: itemId },
        data: { displayOrder: newOrder },
      });
    },
  });
};

export const deleteProjectService = async (id: number): Promise<void> => {
  const existing = await prisma.project.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new NotFoundError(`Project with ID ${id} not found`);
  }

  const fileIdToDelete = existing.imageId;
  const deletedOrder = existing.displayOrder;

  // Transaction: atomically insert pending deletion record, delete project, and renumber remaining projects
  await prisma.$transaction(async (tx) => {
    if (fileIdToDelete) {
      await recordPendingDeletion(fileIdToDelete, tx);
    }
    await tx.project.delete({
      where: { id },
    });
    await tx.project.updateMany({
      where: { displayOrder: { gt: deletedOrder } },
      data: { displayOrder: { decrement: 1 } },
    });
  });

  // After transaction commits, attempt ImageKit deletion
  if (fileIdToDelete) {
    const isDeleted = await deleteImage(fileIdToDelete);
    if (isDeleted) {
      await removePendingDeletion(fileIdToDelete);
    }
  }
};
