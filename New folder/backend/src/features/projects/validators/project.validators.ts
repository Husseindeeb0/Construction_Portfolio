import { CreateProjectRequestDto } from '../dtos/requests/createProject.dto.js'
import { UpdateProjectRequestDto } from '../dtos/requests/updateProject.dto.js'

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
  }
} as const

export const validateCreateProject = (
  body: unknown
): {
  valid: boolean
  errors?: Record<string, string>
  data?: CreateProjectRequestDto
} => {
  const errors: Record<string, string> = {}

  if (typeof body !== 'object' || body === null) {
    return {
      valid: false,
      errors: { body: 'Request body must be a valid JSON object' }
    }
  }

  const record = body as Record<string, unknown>

  // Title
  if (!record.title || typeof record.title !== 'string') {
    errors.title = 'Title is required and must be a string'
  } else {
    const trimmed = record.title.trim()
    if (trimmed.length < PROJECT_VALIDATION_RULES.title.min) {
      errors.title = `Title must be at least ${PROJECT_VALIDATION_RULES.title.min} characters`
    } else if (trimmed.length > PROJECT_VALIDATION_RULES.title.max) {
      errors.title = `Title must not exceed ${PROJECT_VALIDATION_RULES.title.max} characters`
    }
  }

  // Description
  if (!record.description || typeof record.description !== 'string') {
    errors.description = 'Description is required and must be a string'
  } else {
    const trimmed = record.description.trim()
    if (trimmed.length < PROJECT_VALIDATION_RULES.description.min) {
      errors.description = `Description must be at least ${PROJECT_VALIDATION_RULES.description.min} characters`
    } else if (trimmed.length > PROJECT_VALIDATION_RULES.description.max) {
      errors.description = `Description must not exceed ${PROJECT_VALIDATION_RULES.description.max} characters`
    }
  }

  // IsActive (optional boolean, default true)
  if ('isActive' in record && record.isActive !== undefined) {
    if (typeof record.isActive !== 'boolean') {
      errors.isActive = 'isActive must be a boolean'
    }
  }

  // ProjectCategoryId
  if (
    record.projectCategoryId === undefined ||
    typeof record.projectCategoryId !== 'number' ||
    !Number.isInteger(record.projectCategoryId) ||
    record.projectCategoryId <= 0
  ) {
    errors.projectCategoryId = 'Project category ID is required and must be a positive integer'
  }

  // Image (required)
  if (!record.image || typeof record.image !== 'object' || record.image === null) {
    errors.image = 'Image is required and must be an object with file and fileName properties'
  } else {
    const imgObj = record.image as Record<string, unknown>
    if (!imgObj.file || typeof imgObj.file !== 'string') {
      errors['image.file'] = 'Image file is required and must be a string'
    } else if (imgObj.file.trim().length === 0) {
      errors['image.file'] = 'Image file cannot be empty'
    }

    if (!imgObj.fileName || typeof imgObj.fileName !== 'string') {
      errors['image.fileName'] = 'Image fileName is required and must be a string'
    } else {
      const trimmed = imgObj.fileName.trim()
      if (trimmed.length < PROJECT_VALIDATION_RULES.image.fileName.min) {
        errors['image.fileName'] = `File name must be at least ${PROJECT_VALIDATION_RULES.image.fileName.min} characters`
      } else if (trimmed.length > PROJECT_VALIDATION_RULES.image.fileName.max) {
        errors['image.fileName'] = `File name must not exceed ${PROJECT_VALIDATION_RULES.image.fileName.max} characters`
      } else {
        const lower = trimmed.toLowerCase()
        const isValidExt = PROJECT_VALIDATION_RULES.image.allowedExtensions.some((ext) =>
          lower.endsWith(ext)
        )
        if (!isValidExt) {
          errors['image.fileName'] = `File extension must be one of: ${PROJECT_VALIDATION_RULES.image.allowedExtensions.join(
            ', '
          )}`
        }
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors }
  }

  const imgRecord = record.image as { file: string; fileName: string }

  return {
    valid: true,
    data: {
      title: (record.title as string).trim(),
      description: (record.description as string).trim(),
      isActive: typeof record.isActive === 'boolean' ? record.isActive : true,
      projectCategoryId: record.projectCategoryId as number,
      image: {
        file: imgRecord.file.trim(),
        fileName: imgRecord.fileName.trim()
      }
    }
  }
}

export const validateUpdateProject = (
  body: unknown
): {
  valid: boolean
  errors?: Record<string, string>
  data?: UpdateProjectRequestDto
} => {
  const errors: Record<string, string> = {}

  if (typeof body !== 'object' || body === null) {
    return {
      valid: false,
      errors: { body: 'Request body must be a valid JSON object' }
    }
  }

  const record = body as Record<string, unknown>

  const updatableKeys = ['title', 'description', 'isActive', 'projectCategoryId', 'image']
  const hasAtLeastOneField = updatableKeys.some((k) => k in record && record[k] !== undefined)
  if (!hasAtLeastOneField) {
    return {
      valid: false,
      errors: {
        body: 'At least one field (title, description, isActive, projectCategoryId, or image) must be provided'
      }
    }
  }

  // Optional Title
  if ('title' in record && record.title !== undefined) {
    if (typeof record.title !== 'string') {
      errors.title = 'Title must be a string'
    } else {
      const trimmed = record.title.trim()
      if (trimmed.length < PROJECT_VALIDATION_RULES.title.min) {
        errors.title = `Title must be at least ${PROJECT_VALIDATION_RULES.title.min} characters`
      } else if (trimmed.length > PROJECT_VALIDATION_RULES.title.max) {
        errors.title = `Title must not exceed ${PROJECT_VALIDATION_RULES.title.max} characters`
      }
    }
  }

  // Optional Description
  if ('description' in record && record.description !== undefined) {
    if (typeof record.description !== 'string') {
      errors.description = 'Description must be a string'
    } else {
      const trimmed = record.description.trim()
      if (trimmed.length < PROJECT_VALIDATION_RULES.description.min) {
        errors.description = `Description must be at least ${PROJECT_VALIDATION_RULES.description.min} characters`
      } else if (trimmed.length > PROJECT_VALIDATION_RULES.description.max) {
        errors.description = `Description must not exceed ${PROJECT_VALIDATION_RULES.description.max} characters`
      }
    }
  }

  // Optional IsActive
  if ('isActive' in record && record.isActive !== undefined) {
    if (typeof record.isActive !== 'boolean') {
      errors.isActive = 'isActive must be a boolean'
    }
  }

  // Optional ProjectCategoryId
  if ('projectCategoryId' in record && record.projectCategoryId !== undefined) {
    if (
      typeof record.projectCategoryId !== 'number' ||
      !Number.isInteger(record.projectCategoryId) ||
      record.projectCategoryId <= 0
    ) {
      errors.projectCategoryId = 'Project category ID must be a positive integer'
    }
  }

  // Optional Replacement Image
  if ('image' in record && record.image !== undefined && record.image !== null) {
    if (typeof record.image !== 'object') {
      errors.image = 'Image must be an object with file and fileName properties'
    } else {
      const imgObj = record.image as Record<string, unknown>
      if (!imgObj.file || typeof imgObj.file !== 'string') {
        errors['image.file'] = 'Image file is required and must be a string'
      } else if (imgObj.file.trim().length === 0) {
        errors['image.file'] = 'Image file cannot be empty'
      }

      if (!imgObj.fileName || typeof imgObj.fileName !== 'string') {
        errors['image.fileName'] = 'Image fileName is required and must be a string'
      } else {
        const trimmed = imgObj.fileName.trim()
        if (trimmed.length < PROJECT_VALIDATION_RULES.image.fileName.min) {
          errors['image.fileName'] = `File name must be at least ${PROJECT_VALIDATION_RULES.image.fileName.min} characters`
        } else if (trimmed.length > PROJECT_VALIDATION_RULES.image.fileName.max) {
          errors['image.fileName'] = `File name must not exceed ${PROJECT_VALIDATION_RULES.image.fileName.max} characters`
        } else {
          const lower = trimmed.toLowerCase()
          const isValidExt = PROJECT_VALIDATION_RULES.image.allowedExtensions.some((ext) =>
            lower.endsWith(ext)
          )
          if (!isValidExt) {
            errors['image.fileName'] = `File extension must be one of: ${PROJECT_VALIDATION_RULES.image.allowedExtensions.join(
              ', '
            )}`
          }
        }
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors }
  }

  return {
    valid: true,
    data: {
      title: typeof record.title === 'string' ? record.title.trim() : undefined,
      description: typeof record.description === 'string' ? record.description.trim() : undefined,
      isActive: typeof record.isActive === 'boolean' ? record.isActive : undefined,
      projectCategoryId:
        typeof record.projectCategoryId === 'number' ? record.projectCategoryId : undefined,
      image: record.image
        ? {
            file: (record.image as any).file.trim(),
            fileName: (record.image as any).fileName.trim()
          }
        : undefined
    }
  }
}
