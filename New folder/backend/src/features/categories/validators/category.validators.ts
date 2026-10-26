import { CreateCategoryRequestDto } from '../dtos/requests/createCategory.dto.js'
import { UpdateCategoryRequestDto } from '../dtos/requests/updateCategory.dto.js'

export const CATEGORY_VALIDATION_RULES = {
  name: {
    min: 2,
    max: 100
  }
} as const

export const validateCreateCategory = (
  body: unknown
): {
  valid: boolean
  errors?: Record<string, string>
  data?: CreateCategoryRequestDto
} => {
  const errors: Record<string, string> = {}

  if (typeof body !== 'object' || body === null) {
    return {
      valid: false,
      errors: { body: 'Request body must be a valid JSON object' }
    }
  }

  const record = body as Record<string, unknown>

  // Name
  if (!record.name || typeof record.name !== 'string') {
    errors.name = 'Category name is required and must be a string'
  } else {
    const trimmed = record.name.trim()
    if (trimmed.length < CATEGORY_VALIDATION_RULES.name.min) {
      errors.name = `Category name must be at least ${CATEGORY_VALIDATION_RULES.name.min} characters`
    } else if (trimmed.length > CATEGORY_VALIDATION_RULES.name.max) {
      errors.name = `Category name must not exceed ${CATEGORY_VALIDATION_RULES.name.max} characters`
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors }
  }

  return {
    valid: true,
    data: {
      name: (record.name as string).trim()
    }
  }
}

export const validateUpdateCategory = (
  body: unknown
): {
  valid: boolean
  errors?: Record<string, string>
  data?: UpdateCategoryRequestDto
} => {
  const errors: Record<string, string> = {}

  if (typeof body !== 'object' || body === null) {
    return {
      valid: false,
      errors: { body: 'Request body must be a valid JSON object' }
    }
  }

  const record = body as Record<string, unknown>

  if (!record.name || typeof record.name !== 'string') {
    errors.name = 'Category name is required and must be a string'
  } else {
    const trimmed = record.name.trim()
    if (trimmed.length < CATEGORY_VALIDATION_RULES.name.min) {
      errors.name = `Category name must be at least ${CATEGORY_VALIDATION_RULES.name.min} characters`
    } else if (trimmed.length > CATEGORY_VALIDATION_RULES.name.max) {
      errors.name = `Category name must not exceed ${CATEGORY_VALIDATION_RULES.name.max} characters`
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors }
  }

  return {
    valid: true,
    data: {
      name: (record.name as string).trim()
    }
  }
}
