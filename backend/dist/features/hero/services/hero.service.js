import prisma from "../../../configs/prisma.js";
import { uploadImage, deleteImage, } from "../../../externalProviders/imagekit/services/imagekit.service.js";
import { recordPendingDeletion, removePendingDeletion, } from "../../../externalProviders/imagekit/services/pendingImageDeletion.service.js";
import { NotFoundError, ConflictError } from "../../../utils/errors.js";
const mapHeroResponse = (hero) => {
    return {
        id: hero.id,
        badge: hero.badge,
        title: hero.title,
        description: hero.description,
        backgroundImageUrl: hero.backgroundImageUrl,
        createdAt: hero.createdAt,
        updatedAt: hero.updatedAt,
        stats: (hero.stats || []).map((stat) => ({
            id: stat.id,
            label: stat.label,
            value: stat.value,
            displayOrder: stat.displayOrder,
        })),
    };
};
export const getHeroService = async () => {
    const hero = await prisma.hero.findUnique({
        where: { id: 1 },
        include: {
            stats: {
                orderBy: {
                    displayOrder: "asc",
                },
            },
        },
    });
    if (!hero) {
        throw new NotFoundError("Hero section has not been created yet");
    }
    return mapHeroResponse(hero);
};
export const createHeroService = async (dto) => {
    const existing = await prisma.hero.findUnique({
        where: { id: 1 },
    });
    if (existing) {
        throw new ConflictError("Hero section already exists. Use update instead.");
    }
    // Upload background image to ImageKit
    const uploadResult = await uploadImage({
        file: dto.backgroundImage.file,
        fileName: dto.backgroundImage.fileName,
        folder: "/hero",
    });
    const uploadedImage = {
        url: uploadResult.url,
        fileId: uploadResult.fileId,
    };
    try {
        const hero = await prisma.hero.create({
            data: {
                id: 1,
                badge: dto.badge,
                title: dto.title,
                description: dto.description,
                backgroundImageUrl: uploadedImage.url,
                backgroundFileId: uploadedImage.fileId,
                stats: dto.stats && dto.stats.length > 0
                    ? {
                        create: dto.stats.map((s) => ({
                            label: s.label,
                            value: s.value,
                            displayOrder: s.displayOrder,
                        })),
                    }
                    : undefined,
            },
            include: {
                stats: {
                    orderBy: {
                        displayOrder: "asc",
                    },
                },
            },
        });
        return mapHeroResponse(hero);
    }
    catch (dbError) {
        // If DB creation fails, attempt immediate cleanup; if cleanup fails or errors, ensure pending deletion is scheduled
        if (uploadedImage.fileId) {
            try {
                const isDeleted = await deleteImage(uploadedImage.fileId);
                if (!isDeleted) {
                    await recordPendingDeletion(uploadedImage.fileId);
                }
            }
            catch (cleanupError) {
                console.error(`Immediate cleanup error for uploaded hero image (${uploadedImage.fileId}):`, cleanupError);
                try {
                    await recordPendingDeletion(uploadedImage.fileId);
                }
                catch (scheduleError) {
                    console.error(`Failed to schedule pending deletion for uploaded hero image (${uploadedImage.fileId}):`, scheduleError);
                }
            }
        }
        throw dbError;
    }
};
export const updateHeroService = async (dto) => {
    const existing = await prisma.hero.findUnique({
        where: { id: 1 },
        include: {
            stats: true,
        },
    });
    if (!existing) {
        throw new NotFoundError("Hero section not found");
    }
    let newlyUploadedImage = null;
    // If a replacement background image is provided, upload it first
    if (dto.backgroundImage) {
        const uploadResult = await uploadImage({
            file: dto.backgroundImage.file,
            fileName: dto.backgroundImage.fileName,
            folder: "/hero",
        });
        newlyUploadedImage = {
            url: uploadResult.url,
            fileId: uploadResult.fileId,
        };
    }
    const targetImageUrl = newlyUploadedImage
        ? newlyUploadedImage.url
        : existing.backgroundImageUrl;
    const targetImageFileId = newlyUploadedImage
        ? newlyUploadedImage.fileId
        : existing.backgroundFileId;
    const oldFileIdToDelete = newlyUploadedImage
        ? existing.backgroundFileId
        : null;
    try {
        const updated = await prisma.$transaction(async (tx) => {
            // 1. If stats collection is explicitly provided:
            // - If empty array: remove all existing stats
            // - If non-empty array: delete existing and create new ones
            if (dto.stats !== undefined) {
                await tx.heroStat.deleteMany({
                    where: { heroId: 1 },
                });
                if (dto.stats.length > 0) {
                    await tx.heroStat.createMany({
                        data: dto.stats.map((s) => ({
                            heroId: 1,
                            label: s.label,
                            value: s.value,
                            displayOrder: s.displayOrder,
                        })),
                    });
                }
            }
            // 2. Update Hero record
            const hero = await tx.hero.update({
                where: { id: 1 },
                data: {
                    badge: dto.badge ?? existing.badge,
                    title: dto.title ?? existing.title,
                    description: dto.description ?? existing.description,
                    backgroundImageUrl: targetImageUrl,
                    backgroundFileId: targetImageFileId,
                },
                include: {
                    stats: {
                        orderBy: {
                            displayOrder: "asc",
                        },
                    },
                },
            });
            // 3. Atomically record old image pending deletion
            if (oldFileIdToDelete) {
                await recordPendingDeletion(oldFileIdToDelete, tx);
            }
            return hero;
        });
        // After transaction commits, attempt external ImageKit deletion
        if (oldFileIdToDelete) {
            const isDeleted = await deleteImage(oldFileIdToDelete);
            if (isDeleted) {
                await removePendingDeletion(oldFileIdToDelete);
            }
        }
        return mapHeroResponse(updated);
    }
    catch (dbError) {
        // If DB transaction fails, clean up the newly uploaded replacement image
        if (newlyUploadedImage?.fileId) {
            try {
                const isDeleted = await deleteImage(newlyUploadedImage.fileId);
                if (!isDeleted) {
                    await recordPendingDeletion(newlyUploadedImage.fileId);
                }
            }
            catch (cleanupError) {
                console.error(`Immediate cleanup error for replacement hero image (${newlyUploadedImage.fileId}):`, cleanupError);
                try {
                    await recordPendingDeletion(newlyUploadedImage.fileId);
                }
                catch (scheduleError) {
                    console.error(`Failed to schedule pending deletion for replacement hero image (${newlyUploadedImage.fileId}):`, scheduleError);
                }
            }
        }
        throw dbError;
    }
};
export const deleteHeroService = async () => {
    const existing = await prisma.hero.findUnique({
        where: { id: 1 },
    });
    if (!existing) {
        throw new NotFoundError("Hero section not found");
    }
    const fileIdToDelete = existing.backgroundFileId;
    // Transaction: insert pending deletion record and delete Hero atomically (cascade deletes HeroStats)
    await prisma.$transaction(async (tx) => {
        if (fileIdToDelete) {
            await recordPendingDeletion(fileIdToDelete, tx);
        }
        await tx.hero.delete({
            where: { id: 1 },
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
