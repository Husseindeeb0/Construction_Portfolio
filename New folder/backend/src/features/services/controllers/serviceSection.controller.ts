import { Request, Response, NextFunction } from 'express'
import {
  getServiceSectionService,
  createServiceSectionService,
  updateServiceSectionService,
  deleteServiceSectionService,
  reorderServiceItemService
} from '../services/serviceSection.service.js'

/**
 * GET /api/services
 * Public retrieval of Services section and service items.
 * If not admin, only active service items are returned.
 */
export const getServiceSection = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const isPublic = !req.user || req.user.role !== 'ADMIN'
    const serviceSection = await getServiceSectionService(isPublic)
    res.status(200).json({ serviceSection })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/services
 * Protected creation of Services section
 */
export const createServiceSection = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const serviceSection = await createServiceSectionService(req.body)
    res.status(201).json({
      serviceSection,
      message: 'Services section created successfully'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * PUT /api/services
 * Protected update of Services section
 */
export const updateServiceSection = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const serviceSection = await updateServiceSectionService(req.body)
    res.status(200).json({
      serviceSection,
      message: 'Services section updated successfully'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * DELETE /api/services
 * Protected deletion of Services section
 */
export const deleteServiceSection = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await deleteServiceSectionService()
    res.status(200).json({
      message: 'Services section deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * PATCH /api/services/items/:id/reorder
 * Protected reordering of service item
 */
export const reorderServiceItem = async (
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
    await reorderServiceItemService(id, req.body.direction)
    res.status(200).json({
      message: 'Service item reordered successfully'
    })
  } catch (error) {
    next(error)
  }
}

