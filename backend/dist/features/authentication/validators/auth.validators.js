const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const validateSignup = (body) => {
    const errors = {};
    if (typeof body !== 'object' || body === null) {
        return {
            valid: false,
            errors: { body: 'Request body must be a valid JSON object' }
        };
    }
    const record = body;
    // Prevent role injection or privilege escalation
    if ('role' in record) {
        errors.role = 'Specifying a role during signup is not permitted';
    }
    // Validate email
    if (!record.email || typeof record.email !== 'string') {
        errors.email = 'Email is required and must be a string';
    }
    else {
        const trimmedEmail = record.email.trim();
        if (!EMAIL_REGEX.test(trimmedEmail)) {
            errors.email = 'Invalid email format';
        }
    }
    // Validate password
    if (!record.password || typeof record.password !== 'string') {
        errors.password = 'Password is required and must be a string';
    }
    else if (record.password.length < 8) {
        errors.password = 'Password must be at least 8 characters long';
    }
    else if (record.password.length > 128) {
        errors.password = 'Password must not exceed 128 characters';
    }
    if (Object.keys(errors).length > 0) {
        return { valid: false, errors };
    }
    return {
        valid: true,
        data: {
            email: record.email.trim().toLowerCase(),
            password: record.password
        }
    };
};
export const validateSignin = (body) => {
    const errors = {};
    if (typeof body !== 'object' || body === null) {
        return {
            valid: false,
            errors: { body: 'Request body must be a valid JSON object' }
        };
    }
    const record = body;
    if (!record.email || typeof record.email !== 'string') {
        errors.email = 'Email is required and must be a string';
    }
    else {
        const trimmedEmail = record.email.trim();
        if (!EMAIL_REGEX.test(trimmedEmail)) {
            errors.email = 'Invalid email format';
        }
    }
    if (!record.password || typeof record.password !== 'string') {
        errors.password = 'Password is required and must be a string';
    }
    if (Object.keys(errors).length > 0) {
        return { valid: false, errors };
    }
    return {
        valid: true,
        data: {
            email: record.email.trim().toLowerCase(),
            password: record.password
        }
    };
};
