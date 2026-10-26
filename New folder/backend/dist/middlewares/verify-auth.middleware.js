import { verifyAccessToken } from '../utils/jwt.utils.js';
import { UnauthorizedError } from '../utils/errors.js';
import { AUTH_COOKIE_NAME } from '../utils/cookie.utils.js';
export const verifyAuth = (req, _res, next) => {
    const token = req.cookies?.[AUTH_COOKIE_NAME];
    if (!token || typeof token !== 'string') {
        throw new UnauthorizedError('Authentication token missing');
    }
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
};
