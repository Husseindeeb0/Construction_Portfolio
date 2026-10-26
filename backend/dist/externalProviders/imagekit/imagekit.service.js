import imagekit from '../../configs/imagekit.js';
import { AppError } from '../../utils/errors.js';
export const uploadImage = async (options) => {
    try {
        const response = await imagekit.upload({
            file: options.file,
            fileName: options.fileName,
            folder: options.folder || '/uploads'
        });
        return {
            fileId: response.fileId,
            url: response.url,
            name: response.name,
            thumbnailUrl: response.thumbnailUrl
        };
    }
    catch (error) {
        console.error('ImageKit upload error:', error);
        throw new AppError(error?.message || 'Failed to upload image to ImageKit', 502);
    }
};
/**
 * Deletes an image from ImageKit.
 * Distinguishes between successful deletion, already absent (404 / not found),
 * and temporary or permanent deletion failures.
 *
 * @returns {Promise<boolean>} true if deleted or already absent, false if deletion failed.
 */
export const deleteImage = async (fileId) => {
    if (!fileId)
        return true;
    try {
        await imagekit.deleteFile(fileId);
        return true;
    }
    catch (error) {
        // If file is already absent / not found in ImageKit (HTTP 404 or specific message), treat as successful deletion
        const isNotFound = error?.status === 404 ||
            error?.statusCode === 404 ||
            error?.message?.toLowerCase().includes('not found') ||
            error?.help?.toLowerCase().includes('not found');
        if (isNotFound) {
            return true;
        }
        console.error(`ImageKit deletion error for fileId ${fileId}:`, error);
        return false;
    }
};
