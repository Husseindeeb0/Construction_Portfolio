import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt.utils.js'
import { UnauthorizedError } from '../utils/errors.js'
import { AUTH_COOKIE_NAME } from '../utils/cookie.utils.js'

export const verifyAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const token = req.cookies?.[AUTH_COOKIE_NAME]

  if (!token || typeof token !== 'string') {
    throw new UnauthorizedError('Authentication token missing')
  }

  const payload = verifyAccessToken(token)
  req.user = payload

  next()
}
