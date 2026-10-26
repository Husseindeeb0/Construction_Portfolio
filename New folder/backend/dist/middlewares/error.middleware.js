import { AppError } from '../utils/errors.js';
export const errorHandler = (err, _req, res, _next) => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            status: 'error',
            statusCode: err.statusCode,
            message: err.message,
            ...(err.errors ? { errors: err.errors } : {})
        });
        return;
    }
    // Unexpected errors
    console.error('Unhandled server error:', err);
    res.status(500).json({
        status: 'error',
        statusCode: 500,
        message: 'Internal Server Error'
    });
};
