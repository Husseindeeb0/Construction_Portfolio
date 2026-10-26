import { Request, Response, NextFunction } from 'express'
import {
  getProjectsService,
  getProjectByIdService,
  createProjectService,
  updateProjectService,
  deleteProjectService,
  reorderProjectService
} from '../services/project.service.js'
import { BadRequestError } from '../../../utils/errors.js'

import { parsePaginationParams } from '../../../pagination/pagination.utils.js'

// Helper to safely parse numeric route params
const parseIdParam = (req: Request, paramName = 'id'): number => {
  const value = req.params[paramName]
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new BadRequestError(`Invalid ${paramName} parameter: must be a positive integer`)
  }
  return parsed
}

export const getProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // If request does not have an authenticated admin user, filter by active projects
    const isPublic = !req.user || req.user.role !== 'ADMIN'

    // If page or limit query parameters are passed, apply pagination
    const hasPagination = req.query.page !== undefined || req.query.limit !== undefined
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined

    if (hasPagination) {
      const { skip, take, page, limit } = parsePaginationParams(req.query, 10)
      const result = await getProjectsService({
        publicRequest: isPublic,
        categoryId: Number.isInteger(categoryId) ? categoryId : undefined,
        skip,
        take,
        page,
      })
      res.status(200).json(result)
      return
    }

    const result = await getProjectsService({
      publicRequest: isPublic,
      categoryId: Number.isInteger(categoryId) ? categoryId : undefined,
    })
    res.status(200).json(result)
  } catch (error) {
    next(error)
  }
}


export const getProjectById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseIdParam(req)
    const project = await getProjectByIdService(id)
    res.status(200).json({ project })
  } catch (error) {
    next(error)
  }
}

export const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const project = await createProjectService(req.body)
    res.status(201).json({
      project,
      message: 'Project created successfully'
    })
  } catch (error) {
    next(error)
  }
}

export const updateProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseIdParam(req)
    const project = await updateProjectService(id, req.body)
    res.status(200).json({
      project,
      message: 'Project updated successfully'
    })
  } catch (error) {
    next(error)
  }
}

export const reorderProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseIdParam(req)
    await reorderProjectService(id, req.body.direction)
    res.status(200).json({
      message: 'Project reordered successfully'
    })
  } catch (error) {
    next(error)
  }
}

export const deleteProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseIdParam(req)
    await deleteProjectService(id)
    res.status(200).json({
      message: 'Project deleted successfully'
    })
  } catch (error) {
    next(error)
  }
}
