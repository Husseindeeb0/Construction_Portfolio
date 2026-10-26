import { Request, Response, NextFunction } from 'express'
import {
  getAboutService,
  createAboutService,
  updateAboutService,
  deleteAboutService,
  reorderAboutFeatureService
} from '../services/about.service.js'

/**
 * GET /api/about
 * Public retrieval of About section and features.
 * If not admin, only active features are returned.
 */
export const getAbout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const isPublic = !req.user || req.user.role !== 'ADMIN'
    const about = await getAboutService(isPublic)
    res.status(200).json({ about })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/about
 * Protected creation of About section
 */
export const createAbout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const about = await createAboutService(req.body)
    res.status(201).json({
      about,
      message: 'About section created successfully'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * PUT /api/about
 * Protected update of About section
 */
export const updateAbout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const about = await updateAboutService(req.body)
    res.status(200).json({
      about,
      message: 'About section updated successfully'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * DELETE /api/about
 * Protected deletion of About section
 */
export const deleteAbout = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await deleteAboutService()
    res.status(200).json({
      message: 'About section deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}
/**
 * PATCH /api/about/features/:id/reorder
 * Protected reorder of an About feature
 */
export const reorderAboutFeature = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(String(req.params.id), 10)
    const { direction } = req.body
    await reorderAboutFeatureService(id, direction)
    res.status(200).json({ message: 'About feature reordered successfully' })
  } catch (error) {
    next(error)
  }
}
