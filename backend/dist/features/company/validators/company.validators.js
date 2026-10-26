const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+0-9()\-\s]+$/;
// Character length and constraint rules
export const COMPANY_VALIDATION_RULES = {
    companyName: {
        min: 2,
        max: 100,
    },
    phoneNumber: {
        min: 7,
        max: 30,
    },
    email: {
        min: 5,
        max: 254,
    },
    logo: {
        fileName: {
            min: 3,
            max: 255,
        },
        allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".svg"],
    },
};
export const validateCreateCompany = (body) => {
    const errors = {};
    if (typeof body !== "object" || body === null) {
        return {
            valid: false,
            errors: { body: "Request body must be a valid JSON object" },
        };
    }
    const record = body;
    // Validate companyName
    if (!record.companyName || typeof record.companyName !== "string") {
        errors.companyName = "Company name is required and must be a string";
    }
    else {
        const trimmedName = record.companyName.trim();
        if (trimmedName.length < COMPANY_VALIDATION_RULES.companyName.min) {
            errors.companyName = `Company name must be at least ${COMPANY_VALIDATION_RULES.companyName.min} characters long`;
        }
        else if (trimmedName.length > COMPANY_VALIDATION_RULES.companyName.max) {
            errors.companyName = `Company name must not exceed ${COMPANY_VALIDATION_RULES.companyName.max} characters`;
        }
    }
    // Validate phoneNumber
    if (!record.phoneNumber || typeof record.phoneNumber !== "string") {
        errors.phoneNumber = "Phone number is required and must be a string";
    }
    else {
        const trimmedPhone = record.phoneNumber.trim();
        if (trimmedPhone.length < COMPANY_VALIDATION_RULES.phoneNumber.min) {
            errors.phoneNumber = `Phone number must be at least ${COMPANY_VALIDATION_RULES.phoneNumber.min} characters long`;
        }
        else if (trimmedPhone.length > COMPANY_VALIDATION_RULES.phoneNumber.max) {
            errors.phoneNumber = `Phone number must not exceed ${COMPANY_VALIDATION_RULES.phoneNumber.max} characters`;
        }
        else if (!PHONE_REGEX.test(trimmedPhone)) {
            errors.phoneNumber = "Phone number contains invalid characters";
        }
    }
    // Validate email
    if (!record.email || typeof record.email !== "string") {
        errors.email = "Email is required and must be a string";
    }
    else {
        const trimmedEmail = record.email.trim();
        if (trimmedEmail.length < COMPANY_VALIDATION_RULES.email.min) {
            errors.email = `Email must be at least ${COMPANY_VALIDATION_RULES.email.min} characters long`;
        }
        else if (trimmedEmail.length > COMPANY_VALIDATION_RULES.email.max) {
            errors.email = `Email must not exceed ${COMPANY_VALIDATION_RULES.email.max} characters`;
        }
        else if (!EMAIL_REGEX.test(trimmedEmail)) {
            errors.email = "Invalid email format";
        }
    }
    // Validate required logo
    if (!record.logo || typeof record.logo !== "object" || record.logo === null) {
        errors.logo = "Logo is required and must be an object with file and fileName properties";
    }
    else {
        const logoObj = record.logo;
        if (!logoObj.file || typeof logoObj.file !== "string") {
            errors["logo.file"] =
                "Logo file is required and must be a string (base64 data URL, plain base64, or URL)";
        }
        else if (logoObj.file.trim().length === 0) {
            errors["logo.file"] = "Logo file content cannot be empty";
        }
        if (!logoObj.fileName || typeof logoObj.fileName !== "string") {
            errors["logo.fileName"] = "Logo fileName is required and must be a string";
        }
        else {
            const trimmedFileName = logoObj.fileName.trim();
            if (trimmedFileName.length < COMPANY_VALIDATION_RULES.logo.fileName.min) {
                errors["logo.fileName"] = `Logo fileName must be at least ${COMPANY_VALIDATION_RULES.logo.fileName.min} characters long`;
            }
            else if (trimmedFileName.length > COMPANY_VALIDATION_RULES.logo.fileName.max) {
                errors["logo.fileName"] = `Logo fileName must not exceed ${COMPANY_VALIDATION_RULES.logo.fileName.max} characters`;
            }
            else {
                const lowerFileName = trimmedFileName.toLowerCase();
                const hasValidExtension = COMPANY_VALIDATION_RULES.logo.allowedExtensions.some((ext) => lowerFileName.endsWith(ext));
                if (!hasValidExtension) {
                    errors["logo.fileName"] = `Logo file extension must be one of: ${COMPANY_VALIDATION_RULES.logo.allowedExtensions.join(", ")}`;
                }
            }
        }
    }
    if (Object.keys(errors).length > 0) {
        return { valid: false, errors };
    }
    const logoRecord = record.logo;
    return {
        valid: true,
        data: {
            companyName: record.companyName.trim(),
            phoneNumber: record.phoneNumber.trim(),
            email: record.email.trim().toLowerCase(),
            logo: {
                file: logoRecord.file.trim(),
                fileName: logoRecord.fileName.trim(),
            },
        },
    };
};
export const validateUpdateCompany = (body) => {
    const errors = {};
    if (typeof body !== "object" || body === null) {
        return {
            valid: false,
            errors: { body: "Request body must be a valid JSON object" },
        };
    }
    const record = body;
    // Ensure at least one field is provided for update
    const updatableKeys = ["companyName", "phoneNumber", "email", "logo"];
    const hasAtLeastOneField = updatableKeys.some((key) => key in record && record[key] !== undefined);
    if (!hasAtLeastOneField) {
        return {
            valid: false,
            errors: {
                body: "At least one field (companyName, phoneNumber, email, or logo) must be provided for update",
            },
        };
    }
    // Explicitly reject any attempt to remove the logo
    if ("removeLogo" in record) {
        errors.removeLogo = "Company logo is required and cannot be removed";
    }
    // Validate optional companyName
    if ("companyName" in record && record.companyName !== undefined) {
        if (typeof record.companyName !== "string") {
            errors.companyName = "Company name must be a string";
        }
        else {
            const trimmedName = record.companyName.trim();
            if (trimmedName.length < COMPANY_VALIDATION_RULES.companyName.min) {
                errors.companyName = `Company name must be at least ${COMPANY_VALIDATION_RULES.companyName.min} characters long`;
            }
            else if (trimmedName.length > COMPANY_VALIDATION_RULES.companyName.max) {
                errors.companyName = `Company name must not exceed ${COMPANY_VALIDATION_RULES.companyName.max} characters`;
            }
        }
    }
    // Validate optional phoneNumber
    if ("phoneNumber" in record && record.phoneNumber !== undefined) {
        if (typeof record.phoneNumber !== "string") {
            errors.phoneNumber = "Phone number must be a string";
        }
        else {
            const trimmedPhone = record.phoneNumber.trim();
            if (trimmedPhone.length < COMPANY_VALIDATION_RULES.phoneNumber.min) {
                errors.phoneNumber = `Phone number must be at least ${COMPANY_VALIDATION_RULES.phoneNumber.min} characters long`;
            }
            else if (trimmedPhone.length > COMPANY_VALIDATION_RULES.phoneNumber.max) {
                errors.phoneNumber = `Phone number must not exceed ${COMPANY_VALIDATION_RULES.phoneNumber.max} characters`;
            }
            else if (!PHONE_REGEX.test(trimmedPhone)) {
                errors.phoneNumber = "Phone number contains invalid characters";
            }
        }
    }
    // Validate optional email
    if ("email" in record && record.email !== undefined) {
        if (typeof record.email !== "string") {
            errors.email = "Email must be a string";
        }
        else {
            const trimmedEmail = record.email.trim();
            if (trimmedEmail.length < COMPANY_VALIDATION_RULES.email.min) {
                errors.email = `Email must be at least ${COMPANY_VALIDATION_RULES.email.min} characters long`;
            }
            else if (trimmedEmail.length > COMPANY_VALIDATION_RULES.email.max) {
                errors.email = `Email must not exceed ${COMPANY_VALIDATION_RULES.email.max} characters`;
            }
            else if (!EMAIL_REGEX.test(trimmedEmail)) {
                errors.email = "Invalid email format";
            }
        }
    }
    // Validate optional replacement logo
    if ("logo" in record && record.logo !== undefined && record.logo !== null) {
        if (typeof record.logo !== "object") {
            errors.logo = "Logo must be an object with file and fileName properties";
        }
        else {
            const logoObj = record.logo;
            if (!logoObj.file || typeof logoObj.file !== "string") {
                errors["logo.file"] =
                    "Logo file is required and must be a string (base64 data URL, plain base64, or URL)";
            }
            else if (logoObj.file.trim().length === 0) {
                errors["logo.file"] = "Logo file content cannot be empty";
            }
            if (!logoObj.fileName || typeof logoObj.fileName !== "string") {
                errors["logo.fileName"] = "Logo fileName is required and must be a string";
            }
            else {
                const trimmedFileName = logoObj.fileName.trim();
                if (trimmedFileName.length < COMPANY_VALIDATION_RULES.logo.fileName.min) {
                    errors["logo.fileName"] = `Logo fileName must be at least ${COMPANY_VALIDATION_RULES.logo.fileName.min} characters long`;
                }
                else if (trimmedFileName.length > COMPANY_VALIDATION_RULES.logo.fileName.max) {
                    errors["logo.fileName"] = `Logo fileName must not exceed ${COMPANY_VALIDATION_RULES.logo.fileName.max} characters`;
                }
                else {
                    const lowerFileName = trimmedFileName.toLowerCase();
                    const hasValidExtension = COMPANY_VALIDATION_RULES.logo.allowedExtensions.some((ext) => lowerFileName.endsWith(ext));
                    if (!hasValidExtension) {
                        errors["logo.fileName"] = `Logo file extension must be one of: ${COMPANY_VALIDATION_RULES.logo.allowedExtensions.join(", ")}`;
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
            companyName: typeof record.companyName === "string"
                ? record.companyName.trim()
                : undefined,
            phoneNumber: typeof record.phoneNumber === "string"
                ? record.phoneNumber.trim()
                : undefined,
            email: typeof record.email === "string"
                ? record.email.trim().toLowerCase()
                : undefined,
            logo: record.logo
                ? {
                    file: record.logo.file.trim(),
                    fileName: record.logo.fileName.trim(),
                }
                : undefined,
        },
    };
};
