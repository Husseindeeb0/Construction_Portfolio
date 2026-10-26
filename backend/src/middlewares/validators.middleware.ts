import { Request, Response, NextFunction } from 'express'
import { BadRequestError } from '../utils/errors.js'

export type ValidatorFn<T = unknown> = (body: unknown) => {
  valid: boolean
  errors?: Record<string, string>
  data?: T
}

export const validateRequest = (validator: ValidatorFn) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = validator(req.body)

    if (!result.valid) {
      throw new BadRequestError('Validation failed', result.errors)
    }

    if (result.data) {
      req.body = result.data
    }

    next()
  }
}
