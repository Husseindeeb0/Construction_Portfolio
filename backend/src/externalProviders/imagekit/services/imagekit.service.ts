import imagekit from "../../../configs/imagekit.js";
import { ImageKitUploadRequestDto } from "../dtos/requests/imagekitUpload.dto.js";
import { ImageKitUploadResponseDto } from "../dtos/responses/imagekitUpload.dto.js";
import { AppError } from "../../../utils/errors.js";

export const uploadImage = async (
  options: ImageKitUploadRequestDto,
): Promise<ImageKitUploadResponseDto> => {
  try {
    const response = await imagekit.upload({
      file: options.file,
      fileName: options.fileName,
      folder: options.folder || "/uploads",
    });

    return {
      fileId: response.fileId,
      url: response.url,
      name: response.name,
      thumbnailUrl: response.thumbnailUrl,
    };
  } catch (error: any) {
    console.error("ImageKit upload error:", error);
    throw new AppError(
      error?.message || "Failed to upload image to ImageKit",
      502,
    );
  }
};

export const deleteImage = async (fileId: string): Promise<boolean> => {
  if (!fileId) return true;

  // If fileId belongs to local seed dummy identifiers, treat as success without calling ImageKit
  if (fileId.startsWith('local-seed-')) {
    return true;
  }

  try {
    await imagekit.deleteFile(fileId);
    return true;
  } catch (error: any) {
    // If file is already absent / not found in ImageKit (HTTP 404 or specific message), treat as successful deletion
    const isNotFound =
      error?.status === 404 ||
      error?.statusCode === 404 ||
      error?.message?.toLowerCase().includes("not found") ||
      error?.help?.toLowerCase().includes("not found");

    if (isNotFound) {
      return true;
    }

    console.error(`ImageKit deletion error for fileId ${fileId}:`, error);
    return false;
  }
};
