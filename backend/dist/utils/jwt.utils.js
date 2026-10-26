import jwt from 'jsonwebtoken';
import { UnauthorizedError } from './errors.js';
export const generateAccessToken = (payload) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not configured in environment variables');
    }
    const expiresIn = (process.env.JWT_EXPIRES_IN || '1h');
    return jwt.sign(payload, secret, {
        expiresIn
    });
};
export const verifyAccessToken = (token) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not configured in environment variables');
    }
    try {
        const decoded = jwt.verify(token, secret);
        if (typeof decoded !== 'object' ||
            decoded === null ||
            !('id' in decoded) ||
            !('role' in decoded)) {
            throw new UnauthorizedError('Invalid token payload');
        }
        const payload = decoded;
        if (typeof payload.id !== 'number' || typeof payload.role !== 'string') {
            throw new UnauthorizedError('Invalid token payload structure');
        }
        return {
            id: payload.id,
            role: payload.role
        };
    }
    catch (error) {
        if (error instanceof UnauthorizedError) {
            throw error;
        }
        if (error instanceof jwt.TokenExpiredError) {
            throw new UnauthorizedError('Token has expired');
        }
        if (error instanceof jwt.JsonWebTokenError) {
            throw new UnauthorizedError('Invalid token signature or format');
        }
        throw new UnauthorizedError('Authentication token verification failed');
    }
};
