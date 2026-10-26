import { Request, Response, NextFunction } from 'express'
import {
  getTrackRecordSectionService,
  createTrackRecordSectionService,
  updateTrackRecordSectionService,
  deleteTrackRecordSectionService,
  reorderTrackRecordStatService
} from '../services/trackRecordSection.service.js'

/**
 * GET /api/records
 * Public retrieval of Track Record section and stats.
 * If not admin, only active stats are returned.
 */
export const getTrackRecordSection = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const isPublic = !req.user || req.user.role !== 'ADMIN'
    const trackRecordSection = await getTrackRecordSectionService(isPublic)
    res.status(200).json({ trackRecordSection })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/records
 * Protected creation of Track Record section
 */
export const createTrackRecordSection = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const trackRecordSection = await createTrackRecordSectionService(req.body)
    res.status(201).json({
      trackRecordSection,
      message: 'Track record section created successfully'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * PUT /api/records
 * Protected update of Track Record section
 */
export const updateTrackRecordSection = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const trackRecordSection = await updateTrackRecordSectionService(req.body)
    res.status(200).json({
      trackRecordSection,
      message: 'Track record section updated successfully'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * DELETE /api/records
 * Protected deletion of Track Record section
 */
export const deleteTrackRecordSection = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await deleteTrackRecordSectionService()
    res.status(200).json({
      message: 'Track record section deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * PATCH /api/records/stats/:id/reorder
 * Protected reordering of Track Record statistic
 */
export const reorderTrackRecordStat = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const rawId = req.params.id
    const id = Number(rawId)
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ message: 'Invalid id parameter: must be a positive integer' })
      return
    }
    await reorderTrackRecordStatService(id, req.body.direction)
    res.status(200).json({
      message: 'Track record statistic reordered successfully'
    })
  } catch (error) {
    next(error)
  }
}

