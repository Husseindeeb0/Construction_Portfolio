import { Request, Response, NextFunction } from 'express'
import { ForbiddenError, UnauthorizedError } from '../utils/errors.js'
import { UserRole } from '@prisma/client'

export const verifyAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required')
  }

  if (req.user.role !== UserRole.ADMIN) {
    throw new ForbiddenError('Access denied: Administrator privileges required')
  }

  next()
}
