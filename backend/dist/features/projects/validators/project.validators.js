export const PROJECT_VALIDATION_RULES = {
    title: {
        min: 2,
        max: 150
    },
    description: {
        min: 5,
        max: 2000
    },
    image: {
        fileName: {
            min: 3,
            max: 255
        },
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.svg']
    },
    category: {
        name: {
            min: 2,
            max: 100
        }
    }
};
// --- Project Category Validators ---
export const validateCreateProjectCategory = (body) => {
    const errors = {};
    if (typeof body !== 'object' || body === null) {
        return {
            valid: false,
            errors: { body: 'Request body must be a valid JSON object' }
        };
    }
    const record = body;
    // Name
    if (!record.name || typeof record.name !== 'string') {
        errors.name = 'Category name is required and must be a string';
    }
    else {
        const trimmed = record.name.trim();
        if (trimmed.length < PROJECT_VALIDATION_RULES.category.name.min) {
            errors.name = `Category name must be at least ${PROJECT_VALIDATION_RULES.category.name.min} characters`;
        }
        else if (trimmed.length > PROJECT_VALIDATION_RULES.category.name.max) {
            errors.name = `Category name must not exceed ${PROJECT_VALIDATION_RULES.category.name.max} characters`;
        }
    }
    // Display Order
    if (record.displayOrder === undefined ||
        typeof record.displayOrder !== 'number' ||
        !Number.isInteger(record.displayOrder)) {
        errors.displayOrder = 'Display order is required and must be an integer';
    }
    if (Object.keys(errors).length > 0) {
        return { valid: false, errors };
    }
    return {
        valid: true,
        data: {
            name: record.name.trim(),
            displayOrder: record.displayOrder
        }
    };
};
export const validateUpdateProjectCategory = (body) => {
    const errors = {};
    if (typeof body !== 'object' || body === null) {
        return {
            valid: false,
            errors: { body: 'Request body must be a valid JSON object' }
        };
    }
    const record = body;
    const updatableKeys = ['name', 'displayOrder'];
    const hasAtLeastOneField = updatableKeys.some((k) => k in record && record[k] !== undefined);
    if (!hasAtLeastOneField) {
        return {
            valid: false,
            errors: { body: 'At least one field (name or displayOrder) must be provided' }
        };
    }
    if ('name' in record && record.name !== undefined) {
        if (typeof record.name !== 'string') {
            errors.name = 'Category name must be a string';
        }
        else {
            const trimmed = record.name.trim();
            if (trimmed.length < PROJECT_VALIDATION_RULES.category.name.min) {
                errors.name = `Category name must be at least ${PROJECT_VALIDATION_RULES.category.name.min} characters`;
            }
            else if (trimmed.length > PROJECT_VALIDATION_RULES.category.name.max) {
                errors.name = `Category name must not exceed ${PROJECT_VALIDATION_RULES.category.name.max} characters`;
            }
        }
    }
    if ('displayOrder' in record && record.displayOrder !== undefined) {
        if (typeof record.displayOrder !== 'number' || !Number.isInteger(record.displayOrder)) {
            errors.displayOrder = 'Display order must be an integer';
        }
    }
    if (Object.keys(errors).length > 0) {
        return { valid: false, errors };
    }
    return {
        valid: true,
        data: {
            name: typeof record.name === 'string' ? record.name.trim() : undefined,
            displayOrder: typeof record.displayOrder === 'number' ? record.displayOrder : undefined
        }
    };
};
// --- Project Validators ---
export const validateCreateProject = (body) => {
    const errors = {};
    if (typeof body !== 'object' || body === null) {
        return {
            valid: false,
            errors: { body: 'Request body must be a valid JSON object' }
        };
    }
    const record = body;
    // Title
    if (!record.title || typeof record.title !== 'string') {
        errors.title = 'Title is required and must be a string';
    }
    else {
        const trimmed = record.title.trim();
        if (trimmed.length < PROJECT_VALIDATION_RULES.title.min) {
            errors.title = `Title must be at least ${PROJECT_VALIDATION_RULES.title.min} characters`;
        }
        else if (trimmed.length > PROJECT_VALIDATION_RULES.title.max) {
            errors.title = `Title must not exceed ${PROJECT_VALIDATION_RULES.title.max} characters`;
        }
    }
    // Description
    if (!record.description || typeof record.description !== 'string') {
        errors.description = 'Description is required and must be a string';
    }
    else {
        const trimmed = record.description.trim();
        if (trimmed.length < PROJECT_VALIDATION_RULES.description.min) {
            errors.description = `Description must be at least ${PROJECT_VALIDATION_RULES.description.min} characters`;
        }
        else if (trimmed.length > PROJECT_VALIDATION_RULES.description.max) {
            errors.description = `Description must not exceed ${PROJECT_VALIDATION_RULES.description.max} characters`;
        }
    }
    // Display Order
    if (record.displayOrder === undefined ||
        typeof record.displayOrder !== 'number' ||
        !Number.isInteger(record.displayOrder)) {
        errors.displayOrder = 'Display order is required and must be an integer';
    }
    // IsActive (optional boolean, default true)
    if ('isActive' in record && record.isActive !== undefined) {
        if (typeof record.isActive !== 'boolean') {
            errors.isActive = 'isActive must be a boolean';
        }
    }
    // ProjectCategoryId
    if (record.projectCategoryId === undefined ||
        typeof record.projectCategoryId !== 'number' ||
        !Number.isInteger(record.projectCategoryId) ||
        record.projectCategoryId <= 0) {
        errors.projectCategoryId = 'Project category ID is required and must be a positive integer';
    }
    // Image (required)
    if (!record.image || typeof record.image !== 'object' || record.image === null) {
        errors.image = 'Image is required and must be an object with file and fileName properties';
    }
    else {
        const imgObj = record.image;
        if (!imgObj.file || typeof imgObj.file !== 'string') {
            errors['image.file'] = 'Image file is required and must be a string';
        }
        else if (imgObj.file.trim().length === 0) {
            errors['image.file'] = 'Image file cannot be empty';
        }
        if (!imgObj.fileName || typeof imgObj.fileName !== 'string') {
            errors['image.fileName'] = 'Image fileName is required and must be a string';
        }
        else {
            const trimmed = imgObj.fileName.trim();
            if (trimmed.length < PROJECT_VALIDATION_RULES.image.fileName.min) {
                errors['image.fileName'] = `File name must be at least ${PROJECT_VALIDATION_RULES.image.fileName.min} characters`;
            }
            else if (trimmed.length > PROJECT_VALIDATION_RULES.image.fileName.max) {
                errors['image.fileName'] = `File name must not exceed ${PROJECT_VALIDATION_RULES.image.fileName.max} characters`;
            }
            else {
                const lower = trimmed.toLowerCase();
                const isValidExt = PROJECT_VALIDATION_RULES.image.allowedExtensions.some((ext) => lower.endsWith(ext));
                if (!isValidExt) {
                    errors['image.fileName'] = `File extension must be one of: ${PROJECT_VALIDATION_RULES.image.allowedExtensions.join(', ')}`;
                }
            }
        }
    }
    if (Object.keys(errors).length > 0) {
        return { valid: false, errors };
    }
    const imgRecord = record.image;
    return {
        valid: true,
        data: {
            title: record.title.trim(),
            description: record.description.trim(),
            displayOrder: record.displayOrder,
            isActive: typeof record.isActive === 'boolean' ? record.isActive : true,
            projectCategoryId: record.projectCategoryId,
            image: {
                file: imgRecord.file.trim(),
                fileName: imgRecord.fileName.trim()
            }
        }
    };
};
export const validateUpdateProject = (body) => {
    const errors = {};
    if (typeof body !== 'object' || body === null) {
        return {
            valid: false,
            errors: { body: 'Request body must be a valid JSON object' }
        };
    }
    const record = body;
    const updatableKeys = ['title', 'description', 'displayOrder', 'isActive', 'projectCategoryId', 'image'];
    const hasAtLeastOneField = updatableKeys.some((k) => k in record && record[k] !== undefined);
    if (!hasAtLeastOneField) {
        return {
            valid: false,
            errors: {
                body: 'At least one field (title, description, displayOrder, isActive, projectCategoryId, or image) must be provided'
            }
        };
    }
    // Optional Title
    if ('title' in record && record.title !== undefined) {
        if (typeof record.title !== 'string') {
            errors.title = 'Title must be a string';
        }
        else {
            const trimmed = record.title.trim();
            if (trimmed.length < PROJECT_VALIDATION_RULES.title.min) {
                errors.title = `Title must be at least ${PROJECT_VALIDATION_RULES.title.min} characters`;
            }
            else if (trimmed.length > PROJECT_VALIDATION_RULES.title.max) {
                errors.title = `Title must not exceed ${PROJECT_VALIDATION_RULES.title.max} characters`;
            }
        }
    }
    // Optional Description
    if ('description' in record && record.description !== undefined) {
        if (typeof record.description !== 'string') {
            errors.description = 'Description must be a string';
        }
        else {
            const trimmed = record.description.trim();
            if (trimmed.length < PROJECT_VALIDATION_RULES.description.min) {
                errors.description = `Description must be at least ${PROJECT_VALIDATION_RULES.description.min} characters`;
            }
            else if (trimmed.length > PROJECT_VALIDATION_RULES.description.max) {
                errors.description = `Description must not exceed ${PROJECT_VALIDATION_RULES.description.max} characters`;
            }
        }
    }
    // Optional Display Order
    if ('displayOrder' in record && record.displayOrder !== undefined) {
        if (typeof record.displayOrder !== 'number' || !Number.isInteger(record.displayOrder)) {
            errors.displayOrder = 'Display order must be an integer';
        }
    }
    // Optional IsActive
    if ('isActive' in record && record.isActive !== undefined) {
        if (typeof record.isActive !== 'boolean') {
            errors.isActive = 'isActive must be a boolean';
        }
    }
    // Optional ProjectCategoryId
    if ('projectCategoryId' in record && record.projectCategoryId !== undefined) {
        if (typeof record.projectCategoryId !== 'number' ||
            !Number.isInteger(record.projectCategoryId) ||
            record.projectCategoryId <= 0) {
            errors.projectCategoryId = 'Project category ID must be a positive integer';
        }
    }
    // Optional Replacement Image
    if ('image' in record && record.image !== undefined && record.image !== null) {
        if (typeof record.image !== 'object') {
            errors.image = 'Image must be an object with file and fileName properties';
        }
        else {
            const imgObj = record.image;
            if (!imgObj.file || typeof imgObj.file !== 'string') {
                errors['image.file'] = 'Image file is required and must be a string';
            }
            else if (imgObj.file.trim().length === 0) {
                errors['image.file'] = 'Image file cannot be empty';
            }
            if (!imgObj.fileName || typeof imgObj.fileName !== 'string') {
                errors['image.fileName'] = 'Image fileName is required and must be a string';
            }
            else {
                const trimmed = imgObj.fileName.trim();
                if (trimmed.length < PROJECT_VALIDATION_RULES.image.fileName.min) {
                    errors['image.fileName'] = `File name must be at least ${PROJECT_VALIDATION_RULES.image.fileName.min} characters`;
                }
                else if (trimmed.length > PROJECT_VALIDATION_RULES.image.fileName.max) {
                    errors['image.fileName'] = `File name must not exceed ${PROJECT_VALIDATION_RULES.image.fileName.max} characters`;
                }
                else {
                    const lower = trimmed.toLowerCase();
                    const isValidExt = PROJECT_VALIDATION_RULES.image.allowedExtensions.some((ext) => lower.endsWith(ext));
                    if (!isValidExt) {
                        errors['image.fileName'] = `File extension must be one of: ${PROJECT_VALIDATION_RULES.image.allowedExtensions.join(', ')}`;
                    }
                }
            }
        }
    }
    if (Object.keys(errors).length > 0) {
        return { valid: false, errors };
    }
    return {
        valid: true,
        data: {
            title: typeof record.title === 'string' ? record.title.trim() : undefined,
            description: typeof record.description === 'string' ? record.description.trim() : undefined,
            displayOrder: typeof record.displayOrder === 'number' ? record.displayOrder : undefined,
            isActive: typeof record.isActive === 'boolean' ? record.isActive : undefined,
            projectCategoryId: typeof record.projectCategoryId === 'number' ? record.projectCategoryId : undefined,
            image: record.image
                ? {
                    file: record.image.file.trim(),
                    fileName: record.image.fileName.trim()
                }
                : undefined
        }
    };
};
