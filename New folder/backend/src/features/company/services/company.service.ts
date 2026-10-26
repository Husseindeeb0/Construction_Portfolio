import prisma from "../../../configs/prisma.js";
import { CreateCompanyRequestDto } from "../dtos/requests/createCompany.dto.js";
import { UpdateCompanyRequestDto } from "../dtos/requests/updateCompany.dto.js";
import { CompanyResponseDto } from "../dtos/responses/companyResponse.dto.js";
import {
  uploadImage,
  deleteImage,
} from "../../../externalProviders/imagekit/services/imagekit.service.js";
import {
  recordPendingDeletion,
  removePendingDeletion,
} from "../../../externalProviders/imagekit/services/pendingImageDeletion.service.js";
import { NotFoundError, ConflictError } from "../../../utils/errors.js";
import { CompanyProfile } from "@prisma/client";

const mapCompanyResponse = (profile: CompanyProfile): CompanyResponseDto => {
  return {
    id: profile.id,
    companyName: profile.companyName,
    logoUrl: profile.logoUrl,
    phoneNumber: profile.phoneNumber,
    email: profile.email,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
};

export const getCompanyService = async (): Promise<CompanyResponseDto> => {
  const profile = await prisma.companyProfile.findUnique({
    where: { id: 1 },
  });

  if (!profile) {
    throw new NotFoundError("Company profile has not been created yet");
  }

  return mapCompanyResponse(profile);
};

export const createCompanyService = async (
  dto: CreateCompanyRequestDto,
): Promise<CompanyResponseDto> => {
  const existing = await prisma.companyProfile.findUnique({
    where: { id: 1 },
  });

  if (existing) {
    throw new ConflictError(
      "Company profile already exists. Use update instead.",
    );
  }

  // Logo is strictly required on creation
  const uploadResult = await uploadImage({
    file: dto.logo.file,
    fileName: dto.logo.fileName,
    folder: "/company",
  });

  const uploadedLogo = {
    url: uploadResult.url,
    fileId: uploadResult.fileId,
  };

  try {
    const profile = await prisma.companyProfile.create({
      data: {
        id: 1,
        companyName: dto.companyName,
        phoneNumber: dto.phoneNumber,
        email: dto.email,
        logoUrl: uploadedLogo.url,
        logoFileId: uploadedLogo.fileId,
      },
    });

    return mapCompanyResponse(profile);
  } catch (dbError) {
    // If DB save fails, attempt immediate cleanup; if cleanup fails or errors, schedule pending deletion
    if (uploadedLogo.fileId) {
      try {
        const deleted = await deleteImage(uploadedLogo.fileId);
        if (!deleted) {
          await recordPendingDeletion(uploadedLogo.fileId);
        }
      } catch (cleanupError) {
        console.error(
          `Immediate cleanup error for uploaded logo (${uploadedLogo.fileId}):`,
          cleanupError,
        );
        try {
          await recordPendingDeletion(uploadedLogo.fileId);
        } catch (scheduleError) {
          console.error(
            `Failed to schedule pending deletion for uploaded logo (${uploadedLogo.fileId}):`,
            scheduleError,
          );
        }
      }
    }
    throw dbError;
  }
};

export const updateCompanyService = async (
  dto: UpdateCompanyRequestDto,
): Promise<CompanyResponseDto> => {
  const existing = await prisma.companyProfile.findUnique({
    where: { id: 1 },
  });

  if (!existing) {
    throw new NotFoundError("Company profile not found");
  }

  let newlyUploadedLogo: { url: string; fileId: string } | null = null;

  // If a replacement logo is provided, upload it first
  if (dto.logo) {
    const uploadResult = await uploadImage({
      file: dto.logo.file,
      fileName: dto.logo.fileName,
      folder: "/company",
    });
    newlyUploadedLogo = {
      url: uploadResult.url,
      fileId: uploadResult.fileId,
    };
  }

  const targetLogoUrl = newlyUploadedLogo
    ? newlyUploadedLogo.url
    : existing.logoUrl;
  const targetLogoFileId = newlyUploadedLogo
    ? newlyUploadedLogo.fileId
    : existing.logoFileId;
  const oldFileIdToDelete = newlyUploadedLogo ? existing.logoFileId : null;

  try {
    // Run DB update and pending record creation atomically in a transaction
    const updated = await prisma.$transaction(async (tx) => {
      const profile = await tx.companyProfile.update({
        where: { id: 1 },
        data: {
          companyName: dto.companyName ?? existing.companyName,
          phoneNumber: dto.phoneNumber ?? existing.phoneNumber,
          email: dto.email ?? existing.email,
          logoUrl: targetLogoUrl,
          logoFileId: targetLogoFileId,
        },
      });

      if (oldFileIdToDelete) {
        await recordPendingDeletion(oldFileIdToDelete, tx);
      }

      return profile;
    });

    // After transaction commits, attempt external ImageKit deletion
    if (oldFileIdToDelete) {
      const isDeleted = await deleteImage(oldFileIdToDelete);
      if (isDeleted) {
        await removePendingDeletion(oldFileIdToDelete);
      }
    }

    return mapCompanyResponse(updated);
  } catch (dbError) {
    // If DB transaction fails, clean up the newly uploaded replacement image
    if (newlyUploadedLogo?.fileId) {
      try {
        const isDeleted = await deleteImage(newlyUploadedLogo.fileId);
        if (!isDeleted) {
          await recordPendingDeletion(newlyUploadedLogo.fileId);
        }
      } catch (cleanupError) {
        console.error(
          `Immediate cleanup error for replacement logo (${newlyUploadedLogo.fileId}):`,
          cleanupError,
        );
        try {
          await recordPendingDeletion(newlyUploadedLogo.fileId);
        } catch (scheduleError) {
          console.error(
            `Failed to schedule pending deletion for replacement logo (${newlyUploadedLogo.fileId}):`,
            scheduleError,
          );
        }
      }
    }
    throw dbError;
  }
};

export const deleteCompanyService = async (): Promise<void> => {
  const existing = await prisma.companyProfile.findUnique({
    where: { id: 1 },
  });

  if (!existing) {
    throw new NotFoundError("Company profile not found");
  }

  const fileIdToDelete = existing.logoFileId;

  // Transaction: insert pending deletion record and delete entity atomically
  await prisma.$transaction(async (tx) => {
    if (fileIdToDelete) {
      await recordPendingDeletion(fileIdToDelete, tx);
    }
    await tx.companyProfile.delete({
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
