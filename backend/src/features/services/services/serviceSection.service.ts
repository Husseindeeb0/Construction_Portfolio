import prisma from "../../../configs/prisma.js";
import { CreateServiceSectionRequestDto } from "../dtos/requests/createServiceSection.dto.js";
import { UpdateServiceSectionRequestDto } from "../dtos/requests/updateServiceSection.dto.js";
import { ServiceSectionResponseDto } from "../dtos/responses/serviceSectionResponse.dto.js";
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
import { ServiceSection, Service } from "@prisma/client";

type ServiceSectionWithServices = ServiceSection & { services: Service[] };

const mapServiceSectionResponse = (
  section: ServiceSectionWithServices,
): ServiceSectionResponseDto => {
  return {
    id: section.id,
    title: section.title,
    description: section.description,
    imageUrl: section.imageUrl,
    imageText: section.imageText,
    createdAt: section.createdAt,
    updatedAt: section.updatedAt,
    services: (section.services || []).map((service) => ({
      id: service.id,
      title: service.title,
      description: service.description,
      icon: service.icon,
      displayOrder: service.displayOrder,
      isActive: service.isActive,
      serviceSectionId: service.serviceSectionId,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    })),
  };
};

export const getServiceSectionService = async (
  publicRequest = false,
): Promise<ServiceSectionResponseDto> => {
  const section = await prisma.serviceSection.findUnique({
    where: { id: 1 },
    include: {
      services: {
        where: publicRequest ? { isActive: true } : undefined,
        orderBy: {
          displayOrder: "asc",
        },
      },
    },
  });

  if (!section) {
    throw new NotFoundError("Services section has not been created yet");
  }

  return mapServiceSectionResponse(section);
};

export const createServiceSectionService = async (
  dto: CreateServiceSectionRequestDto,
): Promise<ServiceSectionResponseDto> => {
  const existing = await prisma.serviceSection.findUnique({
    where: { id: 1 },
  });

  if (existing) {
    throw new ConflictError(
      "Services section already exists. Use update instead.",
    );
  }

  // Upload image to ImageKit
  const uploadResult = await uploadImage({
    file: dto.image.file,
    fileName: dto.image.fileName,
    folder: "/services",
  });

  const uploadedImage = {
    url: uploadResult.url,
    fileId: uploadResult.fileId,
  };

  try {
    const section = await prisma.serviceSection.create({
      data: {
        id: 1,
        title: dto.title,
        description: dto.description,
        imageUrl: uploadedImage.url,
        imageId: uploadedImage.fileId,
        imageText: dto.imageText,
        services:
          dto.services && dto.services.length > 0
            ? {
                create: dto.services.map((s, index) => ({
                  title: s.title,
                  description: s.description,
                  icon: s.icon,
                  displayOrder: index + 1,
                  isActive: s.isActive !== undefined ? s.isActive : true,
                })),
              }
            : undefined,
      },
      include: {
        services: {
          orderBy: {
            displayOrder: "asc",
          },
        },
      },
    });

    return mapServiceSectionResponse(section);
  } catch (dbError) {
    // If DB creation fails, attempt immediate cleanup;
    // if cleanup fails or errors, ensure pending deletion is scheduled
    if (uploadedImage.fileId) {
      try {
        const isDeleted = await deleteImage(uploadedImage.fileId);
        if (!isDeleted) {
          await recordPendingDeletion(uploadedImage.fileId);
        }
      } catch (cleanupError) {
        console.error(
          `Immediate cleanup error for uploaded service image (${uploadedImage.fileId}):`,
          cleanupError,
        );
        try {
          await recordPendingDeletion(uploadedImage.fileId);
        } catch (scheduleError) {
          console.error(
            `Failed to schedule pending deletion for uploaded service image (${uploadedImage.fileId}):`,
            scheduleError,
          );
        }
      }
    }
    throw dbError;
  }
};

export const updateServiceSectionService = async (
  dto: UpdateServiceSectionRequestDto,
): Promise<ServiceSectionResponseDto> => {
  const existing = await prisma.serviceSection.findUnique({
    where: { id: 1 },
    include: {
      services: true,
    },
  });

  if (!existing) {
    throw new NotFoundError("Services section not found");
  }

  let newlyUploadedImage: { url: string; fileId: string } | null = null;

  // If a replacement image is provided, upload it first
  if (dto.image) {
    const uploadResult = await uploadImage({
      file: dto.image.file,
      fileName: dto.image.fileName,
      folder: "/services",
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
      // 1. If services collection is explicitly provided:
      // - If empty array: remove all existing services
      // - If non-empty array: delete existing and create new ones
      if (dto.services !== undefined) {
        await tx.service.deleteMany({
          where: { serviceSectionId: 1 },
        });

        if (dto.services.length > 0) {
          await tx.service.createMany({
            data: dto.services.map((s, index) => ({
              serviceSectionId: 1,
              title: s.title,
              description: s.description,
              icon: s.icon,
              displayOrder: index + 1,
              isActive: s.isActive !== undefined ? s.isActive : true,
            })),
          });
        }
      }

      // 2. Update ServiceSection record
      const section = await tx.serviceSection.update({
        where: { id: 1 },
        data: {
          title: dto.title ?? existing.title,
          description: dto.description ?? existing.description,
          imageText: dto.imageText ?? existing.imageText,
          imageUrl: targetImageUrl,
          imageId: targetImageId,
        },
        include: {
          services: {
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

      return section;
    });

    // After transaction commits, attempt external ImageKit deletion
    if (oldFileIdToDelete) {
      const isDeleted = await deleteImage(oldFileIdToDelete);
      if (isDeleted) {
        await removePendingDeletion(oldFileIdToDelete);
      }
    }

    return mapServiceSectionResponse(updated);
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
          `Immediate cleanup error for replacement service image (${newlyUploadedImage.fileId}):`,
          cleanupError,
        );
        try {
          await recordPendingDeletion(newlyUploadedImage.fileId);
        } catch (scheduleError) {
          console.error(
            `Failed to schedule pending deletion for replacement service image (${newlyUploadedImage.fileId}):`,
            scheduleError,
          );
        }
      }
    }
    throw dbError;
  }
};

export const deleteServiceSectionService = async (): Promise<void> => {
  const existing = await prisma.serviceSection.findUnique({
    where: { id: 1 },
  });

  if (!existing) {
    throw new NotFoundError("Services section not found");
  }

  const fileIdToDelete = existing.imageId;

  // Transaction: atomically insert pending deletion record and delete ServiceSection (cascade deletes services)
  await prisma.$transaction(async (tx) => {
    if (fileIdToDelete) {
      await recordPendingDeletion(fileIdToDelete, tx);
    }
    await tx.serviceSection.delete({
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

export const reorderServiceItemService = async (
  serviceId: number,
  direction: ReorderDirection,
): Promise<void> => {
  await reorderItemHelper(serviceId, direction, {
    notFoundMessage: `Service with ID ${serviceId} not found`,
    findTarget: async (tx, itemId) => {
      return await tx.service.findFirst({
        where: { id: itemId, serviceSectionId: 1 },
        select: { id: true, displayOrder: true },
      });
    },
    findAdjacent: async (tx, target, dir) => {
      if (dir === "up") {
        return await tx.service.findFirst({
          where: {
            serviceSectionId: 1,
            displayOrder: { lt: target.displayOrder },
          },
          orderBy: { displayOrder: "desc" },
          select: { id: true, displayOrder: true },
        });
      } else {
        return await tx.service.findFirst({
          where: {
            serviceSectionId: 1,
            displayOrder: { gt: target.displayOrder },
          },
          orderBy: { displayOrder: "asc" },
          select: { id: true, displayOrder: true },
        });
      }
    },
    updateOrder: async (tx, itemId, newOrder) => {
      await tx.service.update({
        where: { id: itemId },
        data: { displayOrder: newOrder },
      });
    },
  });
};
