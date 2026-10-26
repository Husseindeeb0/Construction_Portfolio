import { Request, Response, NextFunction } from 'express'
import {
  getProjectCategoriesService,
  getProjectCategoryByIdService,
  createProjectCategoryService,
  updateProjectCategoryService,
  deleteProjectCategoryService,
  reorderProjectCategoryService
} from '../services/category.service.js'
import { BadRequestError } from '../../../utils/errors.js'

const parseIdParam = (req: Request, paramName = 'id'): number => {
  const value = req.params[paramName]
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new BadRequestError(`Invalid ${paramName} parameter: must be a positive integer`)
  }
  return parsed
}

export const getProjectCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await getProjectCategoriesService()
    res.status(200).json({ categories })
  } catch (error) {
    next(error)
  }
}

export const getProjectCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseIdParam(req)
    const category = await getProjectCategoryByIdService(id)
    res.status(200).json({ category })
  } catch (error) {
    next(error)
  }
}

export const createProjectCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const category = await createProjectCategoryService(req.body)
    res.status(201).json({
      category,
      message: 'Project category created successfully'
    })
  } catch (error) {
    next(error)
  }
}

export const updateProjectCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseIdParam(req)
    const category = await updateProjectCategoryService(id, req.body)
    res.status(200).json({
      category,
      message: 'Project category updated successfully'
    })
  } catch (error) {
    next(error)
  }
}

export const reorderProjectCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseIdParam(req)
    await reorderProjectCategoryService(id, req.body.direction)
    res.status(200).json({
      message: 'Project category reordered successfully'
    })
  } catch (error) {
    next(error)
  }
}

export const deleteProjectCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseIdParam(req)
    await deleteProjectCategoryService(id)
    res.status(200).json({
      message: 'Project category deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}
