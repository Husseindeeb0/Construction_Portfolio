import prisma from "../../../configs/prisma.js";
import { CreateAboutRequestDto } from "../dtos/requests/createAbout.dto.js";
import { UpdateAboutRequestDto } from "../dtos/requests/updateAbout.dto.js";
import { AboutResponseDto } from "../dtos/responses/aboutResponse.dto.js";
import {
  uploadImage,
  deleteImage,
} from "../../../externalProviders/imagekit/services/imagekit.service.js";
import {
  recordPendingDeletion,
  removePendingDeletion,
} from "../../../externalProviders/imagekit/services/pendingImageDeletion.service.js";
import { NotFoundError, ConflictError } from "../../../utils/errors.js";
import { reorderItemHelper } from "../../../utils/reorder/reorder.utils.js";
import { ReorderDirection } from "../../../utils/reorder/reorder.dto.js";
import { About, AboutFeature } from "@prisma/client";

type AboutWithFeatures = About & { features: AboutFeature[] };

const mapAboutResponse = (about: AboutWithFeatures): AboutResponseDto => {
  return {
    id: about.id,
    badge: about.badge,
    title: about.title,
    description: about.description,
    primaryImageUrl: about.primaryImageUrl,
    secondaryImageUrl: about.secondaryImageUrl,
    createdAt: about.createdAt,
    updatedAt: about.updatedAt,
    features: (about.features || []).map((feat) => ({
      id: feat.id,
      title: feat.title,
      description: feat.description,
      icon: feat.icon,
      displayOrder: feat.displayOrder,
      isActive: feat.isActive,
      aboutId: feat.aboutId,
    })),
  };
};

// Helper to clean up uploaded images upon error with pending deletion fallback
const safeCleanUpUploadedImages = async (
  fileIds: string[],
  context: string,
): Promise<void> => {
  for (const fileId of fileIds) {
    if (!fileId) continue;
    try {
      const isDeleted = await deleteImage(fileId);
      if (!isDeleted) {
        await recordPendingDeletion(fileId);
      }
    } catch (cleanupError) {
      console.error(
        `Immediate cleanup error for ${context} image (${fileId}):`,
        cleanupError,
      );
      try {
        await recordPendingDeletion(fileId);
      } catch (scheduleError) {
        console.error(
          `Failed to schedule pending deletion for ${context} image (${fileId}):`,
          scheduleError,
        );
      }
    }
  }
};

export const getAboutService = async (
  publicRequest = false,
): Promise<AboutResponseDto> => {
  const about = await prisma.about.findUnique({
    where: { id: 1 },
    include: {
      features: {
        where: publicRequest ? { isActive: true } : undefined,
        orderBy: {
          displayOrder: "asc",
        },
      },
    },
  });

  if (!about) {
    throw new NotFoundError("About section has not been created yet");
  }

  return mapAboutResponse(about);
};

export const createAboutService = async (
  dto: CreateAboutRequestDto,
): Promise<AboutResponseDto> => {
  const existing = await prisma.about.findUnique({
    where: { id: 1 },
  });

  if (existing) {
    throw new ConflictError(
      "About section already exists. Use update instead.",
    );
  }

  const uploadedFileIds: string[] = [];
  let uploadedPrimaryImage: { url: string; fileId: string } | null = null;
  let uploadedSecondaryImage: { url: string; fileId: string } | null = null;

  try {
    // 1. Upload primary image
    const primaryUpload = await uploadImage({
      file: dto.primaryImage.file,
      fileName: dto.primaryImage.fileName,
      folder: "/about",
    });
    uploadedPrimaryImage = {
      url: primaryUpload.url,
      fileId: primaryUpload.fileId,
    };
    uploadedFileIds.push(primaryUpload.fileId);

    // 2. Upload secondary image
    const secondaryUpload = await uploadImage({
      file: dto.secondaryImage.file,
      fileName: dto.secondaryImage.fileName,
      folder: "/about",
    });
    uploadedSecondaryImage = {
      url: secondaryUpload.url,
      fileId: secondaryUpload.fileId,
    };
    uploadedFileIds.push(secondaryUpload.fileId);
  } catch (uploadError) {
    // Clean up any successfully uploaded image before aborting
    await safeCleanUpUploadedImages(uploadedFileIds, "uploaded about");
    throw uploadError;
  }

  try {
    const about = await prisma.about.create({
      data: {
        id: 1,
        badge: dto.badge,
        title: dto.title,
        description: dto.description,
        primaryImageUrl: uploadedPrimaryImage.url,
        primaryImageId: uploadedPrimaryImage.fileId,
        secondaryImageUrl: uploadedSecondaryImage.url,
        secondaryImageId: uploadedSecondaryImage.fileId,
        features:
          dto.features && dto.features.length > 0
            ? {
                create: dto.features.map((f, index) => ({
                  title: f.title,
                  description: f.description,
                  icon: f.icon,
                  displayOrder: index + 1,
                  isActive: f.isActive !== undefined ? f.isActive : true,
                })),
              }
            : undefined,
      },
      include: {
        features: {
          orderBy: {
            displayOrder: "asc",
          },
        },
      },
    });

    return mapAboutResponse(about);
  } catch (dbError) {
    // If DB creation fails, clean up both uploaded images
    await safeCleanUpUploadedImages(uploadedFileIds, "uploaded about");
    throw dbError;
  }
};

export const updateAboutService = async (
  dto: UpdateAboutRequestDto,
): Promise<AboutResponseDto> => {
  const existing = await prisma.about.findUnique({
    where: { id: 1 },
    include: {
      features: true,
    },
  });

  if (!existing) {
    throw new NotFoundError("About section not found");
  }

  const newlyUploadedFileIds: string[] = [];
  let newlyUploadedPrimaryImage: { url: string; fileId: string } | null = null;
  let newlyUploadedSecondaryImage: { url: string; fileId: string } | null =
    null;

  try {
    // 1. Upload replacement primary image if provided
    if (dto.primaryImage) {
      const uploadResult = await uploadImage({
        file: dto.primaryImage.file,
        fileName: dto.primaryImage.fileName,
        folder: "/about",
      });
      newlyUploadedPrimaryImage = {
        url: uploadResult.url,
        fileId: uploadResult.fileId,
      };
      newlyUploadedFileIds.push(uploadResult.fileId);
    }

    // 2. Upload replacement secondary image if provided
    if (dto.secondaryImage) {
      const uploadResult = await uploadImage({
        file: dto.secondaryImage.file,
        fileName: dto.secondaryImage.fileName,
        folder: "/about",
      });
      newlyUploadedSecondaryImage = {
        url: uploadResult.url,
        fileId: uploadResult.fileId,
      };
      newlyUploadedFileIds.push(uploadResult.fileId);
    }
  } catch (uploadError) {
    await safeCleanUpUploadedImages(newlyUploadedFileIds, "replacement about");
    throw uploadError;
  }

  const targetPrimaryImageUrl = newlyUploadedPrimaryImage
    ? newlyUploadedPrimaryImage.url
    : existing.primaryImageUrl;
  const targetPrimaryImageId = newlyUploadedPrimaryImage
    ? newlyUploadedPrimaryImage.fileId
    : existing.primaryImageId;
  const oldPrimaryFileIdToDelete = newlyUploadedPrimaryImage
    ? existing.primaryImageId
    : null;

  const targetSecondaryImageUrl = newlyUploadedSecondaryImage
    ? newlyUploadedSecondaryImage.url
    : existing.secondaryImageUrl;
  const targetSecondaryImageId = newlyUploadedSecondaryImage
    ? newlyUploadedSecondaryImage.fileId
    : existing.secondaryImageId;
  const oldSecondaryFileIdToDelete = newlyUploadedSecondaryImage
    ? existing.secondaryImageId
    : null;

  const oldFileIdsToDelete: string[] = [];
  if (oldPrimaryFileIdToDelete)
    oldFileIdsToDelete.push(oldPrimaryFileIdToDelete);
  if (oldSecondaryFileIdToDelete)
    oldFileIdsToDelete.push(oldSecondaryFileIdToDelete);

  try {
    const updated = await prisma.$transaction(async (tx) => {
      // 1. If features collection is explicitly provided:
      // - If empty array: remove all existing features
      // - If non-empty array: delete existing and create new ones
      if (dto.features !== undefined) {
        await tx.aboutFeature.deleteMany({
          where: { aboutId: 1 },
        });

        if (dto.features.length > 0) {
          await tx.aboutFeature.createMany({
            data: dto.features.map((f, index) => ({
              aboutId: 1,
              title: f.title,
              description: f.description,
              icon: f.icon,
              displayOrder: index + 1,
              isActive: f.isActive !== undefined ? f.isActive : true,
            })),
          });
        }
      }

      // 2. Update About record
      const about = await tx.about.update({
        where: { id: 1 },
        data: {
          badge: dto.badge ?? existing.badge,
          title: dto.title ?? existing.title,
          description: dto.description ?? existing.description,
          primaryImageUrl: targetPrimaryImageUrl,
          primaryImageId: targetPrimaryImageId,
          secondaryImageUrl: targetSecondaryImageUrl,
          secondaryImageId: targetSecondaryImageId,
        },
        include: {
          features: {
            orderBy: {
              displayOrder: "asc",
            },
          },
        },
      });

      // 3. Atomically record old images pending deletion
      for (const oldFileId of oldFileIdsToDelete) {
        await recordPendingDeletion(oldFileId, tx);
      }

      return about;
    });

    // After transaction commits, attempt external ImageKit deletion for old images
    for (const oldFileId of oldFileIdsToDelete) {
      const isDeleted = await deleteImage(oldFileId);
      if (isDeleted) {
        await removePendingDeletion(oldFileId);
      }
    }

    return mapAboutResponse(updated);
  } catch (dbError) {
    // If DB transaction fails, clean up the newly uploaded replacement images
    await safeCleanUpUploadedImages(newlyUploadedFileIds, "replacement about");
    throw dbError;
  }
};

export const deleteAboutService = async (): Promise<void> => {
  const existing = await prisma.about.findUnique({
    where: { id: 1 },
  });

  if (!existing) {
    throw new NotFoundError("About section not found");
  }

  const fileIdsToDelete: string[] = [];
  if (existing.primaryImageId) fileIdsToDelete.push(existing.primaryImageId);
  if (existing.secondaryImageId)
    fileIdsToDelete.push(existing.secondaryImageId);

  // Transaction: atomically insert pending deletion records and delete About (cascade deletes features)
  await prisma.$transaction(async (tx) => {
    for (const fileId of fileIdsToDelete) {
      await recordPendingDeletion(fileId, tx);
    }
    await tx.about.delete({
      where: { id: 1 },
    });
  });

  // After transaction commits, attempt ImageKit deletion
  for (const fileId of fileIdsToDelete) {
    const isDeleted = await deleteImage(fileId);
    if (isDeleted) {
      await removePendingDeletion(fileId);
    }
  }
};

export const reorderAboutFeatureService = async (
  id: number,
  direction: ReorderDirection,
): Promise<void> => {
  await reorderItemHelper(id, direction, {
    notFoundMessage: `About feature with ID ${id} not found`,
    findTarget: async (tx, itemId) => {
      return await tx.aboutFeature.findFirst({
        where: { id: itemId, aboutId: 1 },
        select: { id: true, displayOrder: true },
      });
    },
    findAdjacent: async (tx, target, dir) => {
      if (dir === "up") {
        return await tx.aboutFeature.findFirst({
          where: { aboutId: 1, displayOrder: { lt: target.displayOrder } },
          orderBy: { displayOrder: "desc" },
          select: { id: true, displayOrder: true },
        });
      } else {
        return await tx.aboutFeature.findFirst({
          where: { aboutId: 1, displayOrder: { gt: target.displayOrder } },
          orderBy: { displayOrder: "asc" },
          select: { id: true, displayOrder: true },
        });
      }
    },
    updateOrder: async (tx, itemId, newOrder) => {
      await tx.aboutFeature.update({
        where: { id: itemId },
        data: { displayOrder: newOrder },
      });
    },
  });
};
