import {
  CreateServiceSectionRequestDto,
  ServiceItemRequestDto
} from '../dtos/requests/createServiceSection.dto.js'
import { UpdateServiceSectionRequestDto } from '../dtos/requests/updateServiceSection.dto.js'

export const SERVICE_SECTION_VALIDATION_RULES = {
  title: {
    min: 2,
    max: 150
  },
  description: {
    min: 5,
    max: 1500
  },
  imageText: {
    min: 2,
    max: 200
  },
  image: {
    fileName: {
      min: 3,
      max: 255
    },
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.svg']
  },
  serviceItem: {
    title: {
      min: 2,
      max: 150
    },
    description: {
      min: 5,
      max: 1500
    },
    icon: {
      min: 2,
      max: 100
    }
  }
} as const

const validateServiceItems = (
  items: unknown,
  errors: Record<string, string>
): ServiceItemRequestDto[] | undefined => {
  if (items === undefined) {
    return undefined
  }

  if (!Array.isArray(items)) {
    errors.services = 'Services must be an array'
    return undefined
  }

  const validatedItems: ServiceItemRequestDto[] = []

  items.forEach((item, index) => {
    if (typeof item !== 'object' || item === null) {
      errors[`services[${index}]`] = 'Each service item must be a valid object'
      return
    }

    const record = item as Record<string, unknown>

    // Title
    if (!record.title || typeof record.title !== 'string') {
      errors[`services[${index}].title`] = 'Service title is required and must be a string'
    } else {
      const trimmedTitle = record.title.trim()
      if (trimmedTitle.length < SERVICE_SECTION_VALIDATION_RULES.serviceItem.title.min) {
        errors[`services[${index}].title`] = `Service title must be at least ${SERVICE_SECTION_VALIDATION_RULES.serviceItem.title.min} characters`
      } else if (trimmedTitle.length > SERVICE_SECTION_VALIDATION_RULES.serviceItem.title.max) {
        errors[`services[${index}].title`] = `Service title must not exceed ${SERVICE_SECTION_VALIDATION_RULES.serviceItem.title.max} characters`
      }
    }

    // Description
    if (!record.description || typeof record.description !== 'string') {
      errors[`services[${index}].description`] = 'Service description is required and must be a string'
    } else {
      const trimmedDesc = record.description.trim()
      if (trimmedDesc.length < SERVICE_SECTION_VALIDATION_RULES.serviceItem.description.min) {
        errors[`services[${index}].description`] = `Service description must be at least ${SERVICE_SECTION_VALIDATION_RULES.serviceItem.description.min} characters`
      } else if (trimmedDesc.length > SERVICE_SECTION_VALIDATION_RULES.serviceItem.description.max) {
        errors[`services[${index}].description`] = `Service description must not exceed ${SERVICE_SECTION_VALIDATION_RULES.serviceItem.description.max} characters`
      }
    }

    // Icon
    if (!record.icon || typeof record.icon !== 'string') {
      errors[`services[${index}].icon`] = 'Service icon is required and must be a string'
    } else {
      const trimmedIcon = record.icon.trim()
      if (trimmedIcon.length < SERVICE_SECTION_VALIDATION_RULES.serviceItem.icon.min) {
        errors[`services[${index}].icon`] = `Service icon must be at least ${SERVICE_SECTION_VALIDATION_RULES.serviceItem.icon.min} characters`
      } else if (trimmedIcon.length > SERVICE_SECTION_VALIDATION_RULES.serviceItem.icon.max) {
        errors[`services[${index}].icon`] = `Service icon must not exceed ${SERVICE_SECTION_VALIDATION_RULES.serviceItem.icon.max} characters`
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

export const validateCreateServiceSection = (
  body: unknown
): {
  valid: boolean
  errors?: Record<string, string>
  data?: CreateServiceSectionRequestDto
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
    if (trimmed.length < SERVICE_SECTION_VALIDATION_RULES.title.min) {
      errors.title = `Title must be at least ${SERVICE_SECTION_VALIDATION_RULES.title.min} characters`
    } else if (trimmed.length > SERVICE_SECTION_VALIDATION_RULES.title.max) {
      errors.title = `Title must not exceed ${SERVICE_SECTION_VALIDATION_RULES.title.max} characters`
    }
  }

  // Description
  if (!record.description || typeof record.description !== 'string') {
    errors.description = 'Description is required and must be a string'
  } else {
    const trimmed = record.description.trim()
    if (trimmed.length < SERVICE_SECTION_VALIDATION_RULES.description.min) {
      errors.description = `Description must be at least ${SERVICE_SECTION_VALIDATION_RULES.description.min} characters`
    } else if (trimmed.length > SERVICE_SECTION_VALIDATION_RULES.description.max) {
      errors.description = `Description must not exceed ${SERVICE_SECTION_VALIDATION_RULES.description.max} characters`
    }
  }

  // ImageText
  if (!record.imageText || typeof record.imageText !== 'string') {
    errors.imageText = 'Image text is required and must be a string'
  } else {
    const trimmed = record.imageText.trim()
    if (trimmed.length < SERVICE_SECTION_VALIDATION_RULES.imageText.min) {
      errors.imageText = `Image text must be at least ${SERVICE_SECTION_VALIDATION_RULES.imageText.min} characters`
    } else if (trimmed.length > SERVICE_SECTION_VALIDATION_RULES.imageText.max) {
      errors.imageText = `Image text must not exceed ${SERVICE_SECTION_VALIDATION_RULES.imageText.max} characters`
    }
  }

  // Image (required on creation)
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
      if (trimmed.length < SERVICE_SECTION_VALIDATION_RULES.image.fileName.min) {
        errors['image.fileName'] = `File name must be at least ${SERVICE_SECTION_VALIDATION_RULES.image.fileName.min} characters`
      } else if (trimmed.length > SERVICE_SECTION_VALIDATION_RULES.image.fileName.max) {
        errors['image.fileName'] = `File name must not exceed ${SERVICE_SECTION_VALIDATION_RULES.image.fileName.max} characters`
      } else {
        const lower = trimmed.toLowerCase()
        const isValidExt = SERVICE_SECTION_VALIDATION_RULES.image.allowedExtensions.some((ext) =>
          lower.endsWith(ext)
        )
        if (!isValidExt) {
          errors['image.fileName'] = `File extension must be one of: ${SERVICE_SECTION_VALIDATION_RULES.image.allowedExtensions.join(
            ', '
          )}`
        }
      }
    }
  }

  // Services (optional on creation)
  const validatedServices = validateServiceItems(record.services, errors)

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors }
  }

  const imgRecord = record.image as { file: string; fileName: string }

  return {
    valid: true,
    data: {
      title: (record.title as string).trim(),
      description: (record.description as string).trim(),
      imageText: (record.imageText as string).trim(),
      image: {
        file: imgRecord.file.trim(),
        fileName: imgRecord.fileName.trim()
      },
      services: validatedServices
    }
  }
}

export const validateUpdateServiceSection = (
  body: unknown
): {
  valid: boolean
  errors?: Record<string, string>
  data?: UpdateServiceSectionRequestDto
} => {
  const errors: Record<string, string> = {}

  if (typeof body !== 'object' || body === null) {
    return {
      valid: false,
      errors: { body: 'Request body must be a valid JSON object' }
    }
  }

  const record = body as Record<string, unknown>

  const updatableKeys = ['title', 'description', 'imageText', 'image', 'services']
  const hasAtLeastOneField = updatableKeys.some((k) => k in record && record[k] !== undefined)
  if (!hasAtLeastOneField) {
    return {
      valid: false,
      errors: {
        body: 'At least one field (title, description, imageText, image, or services) must be provided'
      }
    }
  }

  // Optional Title
  if ('title' in record && record.title !== undefined) {
    if (typeof record.title !== 'string') {
      errors.title = 'Title must be a string'
    } else {
      const trimmed = record.title.trim()
      if (trimmed.length < SERVICE_SECTION_VALIDATION_RULES.title.min) {
        errors.title = `Title must be at least ${SERVICE_SECTION_VALIDATION_RULES.title.min} characters`
      } else if (trimmed.length > SERVICE_SECTION_VALIDATION_RULES.title.max) {
        errors.title = `Title must not exceed ${SERVICE_SECTION_VALIDATION_RULES.title.max} characters`
      }
    }
  }

  // Optional Description
  if ('description' in record && record.description !== undefined) {
    if (typeof record.description !== 'string') {
      errors.description = 'Description must be a string'
    } else {
      const trimmed = record.description.trim()
      if (trimmed.length < SERVICE_SECTION_VALIDATION_RULES.description.min) {
        errors.description = `Description must be at least ${SERVICE_SECTION_VALIDATION_RULES.description.min} characters`
      } else if (trimmed.length > SERVICE_SECTION_VALIDATION_RULES.description.max) {
        errors.description = `Description must not exceed ${SERVICE_SECTION_VALIDATION_RULES.description.max} characters`
      }
    }
  }

  // Optional ImageText
  if ('imageText' in record && record.imageText !== undefined) {
    if (typeof record.imageText !== 'string') {
      errors.imageText = 'Image text must be a string'
    } else {
      const trimmed = record.imageText.trim()
      if (trimmed.length < SERVICE_SECTION_VALIDATION_RULES.imageText.min) {
        errors.imageText = `Image text must be at least ${SERVICE_SECTION_VALIDATION_RULES.imageText.min} characters`
      } else if (trimmed.length > SERVICE_SECTION_VALIDATION_RULES.imageText.max) {
        errors.imageText = `Image text must not exceed ${SERVICE_SECTION_VALIDATION_RULES.imageText.max} characters`
      }
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
        if (trimmed.length < SERVICE_SECTION_VALIDATION_RULES.image.fileName.min) {
          errors['image.fileName'] = `File name must be at least ${SERVICE_SECTION_VALIDATION_RULES.image.fileName.min} characters`
        } else if (trimmed.length > SERVICE_SECTION_VALIDATION_RULES.image.fileName.max) {
          errors['image.fileName'] = `File name must not exceed ${SERVICE_SECTION_VALIDATION_RULES.image.fileName.max} characters`
        } else {
          const lower = trimmed.toLowerCase()
          const isValidExt = SERVICE_SECTION_VALIDATION_RULES.image.allowedExtensions.some((ext) =>
            lower.endsWith(ext)
          )
          if (!isValidExt) {
            errors['image.fileName'] = `File extension must be one of: ${SERVICE_SECTION_VALIDATION_RULES.image.allowedExtensions.join(
              ', '
            )}`
          }
        }
      }
    }
  }

  // Optional Services
  const validatedServices =
    'services' in record ? validateServiceItems(record.services, errors) : undefined

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors }
  }

  return {
    valid: true,
    data: {
      title: typeof record.title === 'string' ? record.title.trim() : undefined,
      description: typeof record.description === 'string' ? record.description.trim() : undefined,
      imageText: typeof record.imageText === 'string' ? record.imageText.trim() : undefined,
      image: record.image
        ? {
            file: (record.image as any).file.trim(),
            fileName: (record.image as any).fileName.trim()
          }
        : undefined,
      services: validatedServices
    }
  }
}
