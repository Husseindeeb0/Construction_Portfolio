import { deleteImage } from '../../externalProviders/imagekit/services/imagekit.service.js'
import {
  getDuePendingDeletions,
  removePendingDeletion,
  recordFailedDeletionAttempt
} from '../../externalProviders/imagekit/services/pendingImageDeletion.service.js'

let intervalId: NodeJS.Timeout | null = null
let isProcessing = false

const DEFAULT_INTERVAL_MS = 60 * 10 * 1000 // 10 minutes

/**
 * Processes a single batch of due pending image deletions.
 * Continues processing subsequent records even if one fails.
 */
export const processPendingImageDeletions = async (batchSize = 20): Promise<void> => {
  const pendingRecords = await getDuePendingDeletions(batchSize)

  if (pendingRecords.length === 0) {
    return
  }

  for (const record of pendingRecords) {
    try {
      const isDeletedOrAbsent = await deleteImage(record.fileId)

      if (isDeletedOrAbsent) {
        await removePendingDeletion(record.fileId)
      } else {
        await recordFailedDeletionAttempt(
          record.fileId,
          'ImageKit delete call failed',
          record.attemptCount
        )
      }
    } catch (error: any) {
      await recordFailedDeletionAttempt(
        record.fileId,
        error?.message || 'Unexpected error during deletion attempt',
        record.attemptCount
      )
    }
  }
}

/**
 * Runs one tick of the image deletion job, guarding against overlapping executions.
 */
export const runImageDeletionJobTick = async (): Promise<void> => {
  if (isProcessing) {
    return
  }

  isProcessing = true
  try {
    await processPendingImageDeletions()
  } catch (error) {
    console.error('Error during image deletion job execution:', error)
  } finally {
    isProcessing = false
  }
}

/**
 * Starts the periodic background job for processing pending image deletions.
 */
export const startImageDeletionJob = (intervalMs = DEFAULT_INTERVAL_MS): void => {
  if (intervalId) {
    return
  }

  // Run initial tick shortly after startup
  setTimeout(() => {
    runImageDeletionJobTick().catch((err) => {
      console.error('Initial image deletion job tick error:', err)
    })
  }, 5000)

  intervalId = setInterval(runImageDeletionJobTick, intervalMs)
  console.log(`Image deletion background job started (interval: ${intervalMs}ms)`)
}

/**
 * Stops the background job cleanly on shutdown.
 */
export const stopImageDeletionJob = (): void => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
    console.log('Image deletion background job stopped')
  }
}
