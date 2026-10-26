import { Request, Response, NextFunction } from 'express'
import {
  getHeroService,
  createHeroService,
  updateHeroService,
  deleteHeroService,
  reorderHeroStatService
} from '../services/hero.service.js'

/**
 * GET /api/hero
 * Public retrieval of Hero section and statistics
 */
export const getHero = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const hero = await getHeroService()
    res.status(200).json({ hero })
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/hero
 * Protected creation of Hero section
 */
export const createHero = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const hero = await createHeroService(req.body)
    res.status(201).json({
      hero,
      message: 'Hero section created successfully'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * PUT /api/hero
 * Protected update of Hero section
 */
export const updateHero = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const hero = await updateHeroService(req.body)
    res.status(200).json({
      hero,
      message: 'Hero section updated successfully'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * DELETE /api/hero
 * Protected deletion of Hero section
 */
export const deleteHero = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await deleteHeroService()
    res.status(200).json({
      message: 'Hero section deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}

/**
 * PATCH /api/hero/stats/:id/reorder
 * Protected reordering of Hero statistics
 */
export const reorderHeroStat = async (
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
    await reorderHeroStatService(id, req.body.direction)
    res.status(200).json({
      message: 'Hero statistic reordered successfully'
    })
  } catch (error) {
    next(error)
  }
}
