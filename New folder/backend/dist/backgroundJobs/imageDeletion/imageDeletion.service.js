import { deleteImage } from '../../externalProviders/imagekit/imagekit.service.js';
import { getDuePendingDeletions, removePendingDeletion, recordFailedDeletionAttempt } from '../../externalProviders/imagekit/services/pendingImageDeletion.service.js';
/**
 * Processes a single batch of due pending image deletions.
 * Continues processing subsequent records even if one fails.
 */
export const processPendingImageDeletions = async (batchSize = 20) => {
    const pendingRecords = await getDuePendingDeletions(batchSize);
    if (pendingRecords.length === 0) {
        return;
    }
    for (const record of pendingRecords) {
        try {
            const isDeletedOrAbsent = await deleteImage(record.fileId);
            if (isDeletedOrAbsent) {
                await removePendingDeletion(record.fileId);
            }
            else {
                await recordFailedDeletionAttempt(record.fileId, 'ImageKit delete call failed', record.attemptCount);
            }
        }
        catch (error) {
            await recordFailedDeletionAttempt(record.fileId, error?.message || 'Unexpected error during deletion attempt', record.attemptCount);
        }
    }
};
