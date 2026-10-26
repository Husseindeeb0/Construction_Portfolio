import {
  CreateAboutRequestDto,
  AboutFeatureItemRequestDto
} from '../dtos/requests/createAbout.dto.js'
import { UpdateAboutRequestDto } from '../dtos/requests/updateAbout.dto.js'

export const ABOUT_VALIDATION_RULES = {
  badge: {
    min: 2,
    max: 50
  },
  title: {
    min: 2,
    max: 150
  },
  description: {
    min: 5,
    max: 4800
  },
  image: {
    fileName: {
      min: 3,
      max: 255
    },
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.svg']
  },
  featureItem: {
    title: {
      min: 2,
      max: 150
    },
    description: {
      min: 5,
      max: 1000
    },
    icon: {
      min: 2,
      max: 100
    }
  }
} as const

const validateImageObject = (
  img: unknown,
  fieldName: string,
  errors: Record<string, string>
): { file: string; fileName: string } | null => {
  if (!img || typeof img !== 'object') {
    errors[fieldName] = `${fieldName} is required and must be an object with file and fileName properties`
    return null
  }

  const record = img as Record<string, unknown>

  if (!record.file || typeof record.file !== 'string') {
    errors[`${fieldName}.file`] = `${fieldName} file is required and must be a string`
  } else if (record.file.trim().length === 0) {
    errors[`${fieldName}.file`] = `${fieldName} file cannot be empty`
  }

  if (!record.fileName || typeof record.fileName !== 'string') {
    errors[`${fieldName}.fileName`] = `${fieldName} fileName is required and must be a string`
  } else {
    const trimmed = record.fileName.trim()
    if (trimmed.length < ABOUT_VALIDATION_RULES.image.fileName.min) {
      errors[`${fieldName}.fileName`] = `File name must be at least ${ABOUT_VALIDATION_RULES.image.fileName.min} characters`
    } else if (trimmed.length > ABOUT_VALIDATION_RULES.image.fileName.max) {
      errors[`${fieldName}.fileName`] = `File name must not exceed ${ABOUT_VALIDATION_RULES.image.fileName.max} characters`
    } else {
      const lower = trimmed.toLowerCase()
      const isValidExt = ABOUT_VALIDATION_RULES.image.allowedExtensions.some((ext) =>
        lower.endsWith(ext)
      )
      if (!isValidExt) {
        errors[`${fieldName}.fileName`] = `File extension must be one of: ${ABOUT_VALIDATION_RULES.image.allowedExtensions.join(
          ', '
        )}`
      }
    }
  }

  if (errors[`${fieldName}.file`] || errors[`${fieldName}.fileName`]) {
    return null
  }

  return {
    file: (record.file as string).trim(),
    fileName: (record.fileName as string).trim()
  }
}

const validateAboutFeatures = (
  items: unknown,
  errors: Record<string, string>
): AboutFeatureItemRequestDto[] | undefined => {
  if (items === undefined) {
    return undefined
  }

  if (!Array.isArray(items)) {
    errors.features = 'Features must be an array'
    return undefined
  }

  const validatedItems: AboutFeatureItemRequestDto[] = []

  items.forEach((item, index) => {
    if (typeof item !== 'object' || item === null) {
      errors[`features[${index}]`] = 'Each feature item must be a valid object'
      return
    }

    const record = item as Record<string, unknown>

    // Title
    if (!record.title || typeof record.title !== 'string') {
      errors[`features[${index}].title`] = 'Feature title is required and must be a string'
    } else {
      const trimmedTitle = record.title.trim()
      if (trimmedTitle.length < ABOUT_VALIDATION_RULES.featureItem.title.min) {
        errors[`features[${index}].title`] = `Feature title must be at least ${ABOUT_VALIDATION_RULES.featureItem.title.min} characters`
      } else if (trimmedTitle.length > ABOUT_VALIDATION_RULES.featureItem.title.max) {
        errors[`features[${index}].title`] = `Feature title must not exceed ${ABOUT_VALIDATION_RULES.featureItem.title.max} characters`
      }
    }

    // Description
    if (!record.description || typeof record.description !== 'string') {
      errors[`features[${index}].description`] = 'Feature description is required and must be a string'
    } else {
      const trimmedDesc = record.description.trim()
      if (trimmedDesc.length < ABOUT_VALIDATION_RULES.featureItem.description.min) {
        errors[`features[${index}].description`] = `Feature description must be at least ${ABOUT_VALIDATION_RULES.featureItem.description.min} characters`
      } else if (trimmedDesc.length > ABOUT_VALIDATION_RULES.featureItem.description.max) {
        errors[`features[${index}].description`] = `Feature description must not exceed ${ABOUT_VALIDATION_RULES.featureItem.description.max} characters`
      }
    }

    // Icon
    if (!record.icon || typeof record.icon !== 'string') {
      errors[`features[${index}].icon`] = 'Feature icon is required and must be a string'
    } else {
      const trimmedIcon = record.icon.trim()
      if (trimmedIcon.length < ABOUT_VALIDATION_RULES.featureItem.icon.min) {
        errors[`features[${index}].icon`] = `Feature icon must be at least ${ABOUT_VALIDATION_RULES.featureItem.icon.min} characters`
      } else if (trimmedIcon.length > ABOUT_VALIDATION_RULES.featureItem.icon.max) {
        errors[`features[${index}].icon`] = `Feature icon must not exceed ${ABOUT_VALIDATION_RULES.featureItem.icon.max} characters`
      }
    }

    if (
      typeof record.title === 'string' &&
      typeof record.description === 'string' &&
      typeof record.icon === 'string'
    ) {
      validatedItems.push({
        title: (record.title as string).trim(),
        description: (record.description as string).trim(),
        icon: (record.icon as string).trim(),
        isActive: typeof record.isActive === 'boolean' ? record.isActive : true
      })
    }
  })

  return validatedItems
}

export const validateCreateAbout = (
  body: unknown
): {
  valid: boolean
  errors?: Record<string, string>
  data?: CreateAboutRequestDto
} => {
  const errors: Record<string, string> = {}

  if (typeof body !== 'object' || body === null) {
    return {
      valid: false,
      errors: { body: 'Request body must be a valid JSON object' }
    }
  }

  const record = body as Record<string, unknown>

  // Badge
  if (!record.badge || typeof record.badge !== 'string') {
    errors.badge = 'Badge is required and must be a string'
  } else {
    const trimmed = record.badge.trim()
    if (trimmed.length < ABOUT_VALIDATION_RULES.badge.min) {
      errors.badge = `Badge must be at least ${ABOUT_VALIDATION_RULES.badge.min} characters`
    } else if (trimmed.length > ABOUT_VALIDATION_RULES.badge.max) {
      errors.badge = `Badge must not exceed ${ABOUT_VALIDATION_RULES.badge.max} characters`
    }
  }

  // Title
  if (!record.title || typeof record.title !== 'string') {
    errors.title = 'Title is required and must be a string'
  } else {
    const trimmed = record.title.trim()
    if (trimmed.length < ABOUT_VALIDATION_RULES.title.min) {
      errors.title = `Title must be at least ${ABOUT_VALIDATION_RULES.title.min} characters`
    } else if (trimmed.length > ABOUT_VALIDATION_RULES.title.max) {
      errors.title = `Title must not exceed ${ABOUT_VALIDATION_RULES.title.max} characters`
    }
  }

  // Description
  if (!record.description || typeof record.description !== 'string') {
    errors.description = 'Description is required and must be a string'
  } else {
    const trimmed = record.description.trim()
    if (trimmed.length < ABOUT_VALIDATION_RULES.description.min) {
      errors.description = `Description must be at least ${ABOUT_VALIDATION_RULES.description.min} characters`
    } else if (trimmed.length > ABOUT_VALIDATION_RULES.description.max) {
      errors.description = `Description must not exceed ${ABOUT_VALIDATION_RULES.description.max} characters`
    }
  }

  // Primary image
  const validatedPrimaryImage = validateImageObject(record.primaryImage, 'primaryImage', errors)

  // Secondary image
  const validatedSecondaryImage = validateImageObject(
    record.secondaryImage,
    'secondaryImage',
    errors
  )

  // Features (optional on creation)
  const validatedFeatures = validateAboutFeatures(record.features, errors)

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors }
  }

  return {
    valid: true,
    data: {
      badge: (record.badge as string).trim(),
      title: (record.title as string).trim(),
      description: (record.description as string).trim(),
      primaryImage: validatedPrimaryImage!,
      secondaryImage: validatedSecondaryImage!,
      features: validatedFeatures
    }
  }
}

export const validateUpdateAbout = (
  body: unknown
): {
  valid: boolean
  errors?: Record<string, string>
  data?: UpdateAboutRequestDto
} => {
  const errors: Record<string, string> = {}

  if (typeof body !== 'object' || body === null) {
    return {
      valid: false,
      errors: { body: 'Request body must be a valid JSON object' }
    }
  }

  const record = body as Record<string, unknown>

  const updatableKeys = [
    'badge',
    'title',
    'description',
    'primaryImage',
    'secondaryImage',
    'features'
  ]
  const hasAtLeastOneField = updatableKeys.some((k) => k in record && record[k] !== undefined)
  if (!hasAtLeastOneField) {
    return {
      valid: false,
      errors: {
        body: 'At least one field (badge, title, description, primaryImage, secondaryImage, or features) must be provided'
      }
    }
  }

  // Optional Badge
  if ('badge' in record && record.badge !== undefined) {
    if (typeof record.badge !== 'string') {
      errors.badge = 'Badge must be a string'
    } else {
      const trimmed = record.badge.trim()
      if (trimmed.length < ABOUT_VALIDATION_RULES.badge.min) {
        errors.badge = `Badge must be at least ${ABOUT_VALIDATION_RULES.badge.min} characters`
      } else if (trimmed.length > ABOUT_VALIDATION_RULES.badge.max) {
        errors.badge = `Badge must not exceed ${ABOUT_VALIDATION_RULES.badge.max} characters`
      }
    }
  }

  // Optional Title
  if ('title' in record && record.title !== undefined) {
    if (typeof record.title !== 'string') {
      errors.title = 'Title must be a string'
    } else {
      const trimmed = record.title.trim()
      if (trimmed.length < ABOUT_VALIDATION_RULES.title.min) {
        errors.title = `Title must be at least ${ABOUT_VALIDATION_RULES.title.min} characters`
      } else if (trimmed.length > ABOUT_VALIDATION_RULES.title.max) {
        errors.title = `Title must not exceed ${ABOUT_VALIDATION_RULES.title.max} characters`
      }
    }
  }

  // Optional Description
  if ('description' in record && record.description !== undefined) {
    if (typeof record.description !== 'string') {
      errors.description = 'Description must be a string'
    } else {
      const trimmed = record.description.trim()
      if (trimmed.length < ABOUT_VALIDATION_RULES.description.min) {
        errors.description = `Description must be at least ${ABOUT_VALIDATION_RULES.description.min} characters`
      } else if (trimmed.length > ABOUT_VALIDATION_RULES.description.max) {
        errors.description = `Description must not exceed ${ABOUT_VALIDATION_RULES.description.max} characters`
      }
    }
  }

  // Optional Primary Image
  let validatedPrimaryImage: { file: string; fileName: string } | undefined
  if ('primaryImage' in record && record.primaryImage !== undefined && record.primaryImage !== null) {
    const res = validateImageObject(record.primaryImage, 'primaryImage', errors)
    if (res) validatedPrimaryImage = res
  }

  // Optional Secondary Image
  let validatedSecondaryImage: { file: string; fileName: string } | undefined
  if (
    'secondaryImage' in record &&
    record.secondaryImage !== undefined &&
    record.secondaryImage !== null
  ) {
    const res = validateImageObject(record.secondaryImage, 'secondaryImage', errors)
    if (res) validatedSecondaryImage = res
  }

  // Optional Features
  const validatedFeatures =
    'features' in record ? validateAboutFeatures(record.features, errors) : undefined

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors }
  }

  return {
    valid: true,
    data: {
      badge: typeof record.badge === 'string' ? record.badge.trim() : undefined,
      title: typeof record.title === 'string' ? record.title.trim() : undefined,
      description: typeof record.description === 'string' ? record.description.trim() : undefined,
      primaryImage: validatedPrimaryImage,
      secondaryImage: validatedSecondaryImage,
      features: validatedFeatures
    }
  }
}
