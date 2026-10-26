import { ForbiddenError, UnauthorizedError } from '../utils/errors.js';
import { UserRole } from '@prisma/client';
export const verifyAdmin = (req, _res, next) => {
    if (!req.user) {
        throw new UnauthorizedError('Authentication required');
    }
    if (req.user.role !== UserRole.ADMIN) {
        throw new ForbiddenError('Access denied: Administrator privileges required');
    }
    next();
};
