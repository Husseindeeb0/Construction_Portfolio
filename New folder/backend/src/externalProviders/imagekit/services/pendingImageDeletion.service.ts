import prisma from '../../../configs/prisma.js'
import { Prisma } from '@prisma/client'

export type PrismaTransactionClient = Prisma.TransactionClient

export const recordPendingDeletion = async (
  fileId: string,
  tx?: PrismaTransactionClient
): Promise<void> => {
  if (!fileId) return

  const client = tx || prisma

  await client.pendingImageDeletion.upsert({
    where: { fileId },
    update: {},
    create: {
      fileId,
      attemptCount: 0,
      nextAttemptAt: new Date()
    }
  })
}

export const removePendingDeletion = async (
  fileId: string,
  tx?: PrismaTransactionClient
): Promise<void> => {
  if (!fileId) return

  const client = tx || prisma

  try {
    await client.pendingImageDeletion.delete({
      where: { fileId }
    })
  } catch (error: any) {
    // If already deleted / record not found (P2025), ignore
    if (error?.code !== 'P2025') {
      console.error(`Failed to remove pending deletion for fileId ${fileId}:`, error)
    }
  }
}

/**
 * Retrieves a bounded batch of pending image deletions that are due for another attempt.
 */
export const getDuePendingDeletions = async (
  limit = 20
) => {
  return prisma.pendingImageDeletion.findMany({
    where: {
      nextAttemptAt: {
        lte: new Date()
      }
    },
    orderBy: {
      nextAttemptAt: 'asc'
    },
    take: limit
  })
}

/**
 * Records a failed deletion attempt, incrementing attempt count, recording the error,
 * and computing the nextAttemptAt using exponential backoff with a cap.
 */
export const recordFailedDeletionAttempt = async (
  fileId: string,
  errorMessage: string,
  currentAttempts: number
): Promise<void> => {
  const newAttemptCount = currentAttempts + 1
  // Backoff: 1 min, 2 min, 4 min, 8 min, max 30 min
  const backoffMinutes = Math.min(Math.pow(2, Math.max(0, newAttemptCount - 1)), 30)
  const nextAttemptAt = new Date(Date.now() + backoffMinutes * 60 * 1000)

  try {
    await prisma.pendingImageDeletion.update({
      where: { fileId },
      data: {
        attemptCount: newAttemptCount,
        lastError: errorMessage,
        nextAttemptAt
      }
    })
  } catch (error) {
    console.error(`Failed to record failed deletion attempt for fileId ${fileId}:`, error)
  }
}
