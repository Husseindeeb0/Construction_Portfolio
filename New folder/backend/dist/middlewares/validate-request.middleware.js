import { BadRequestError } from '../utils/errors.js';
export const validateRequest = (validator) => {
    return (req, _res, next) => {
        const result = validator(req.body);
        if (!result.valid) {
            throw new BadRequestError('Validation failed', result.errors);
        }
        if (result.data) {
            req.body = result.data;
        }
        next();
    };
};
