import { CreateHeroRequestDto, HeroStatRequestDto } from '../dtos/requests/createHero.dto.js'
import { UpdateHeroRequestDto } from '../dtos/requests/updateHero.dto.js'

export const HERO_VALIDATION_RULES = {
  badge: {
    min: 2,
    max: 50,
  },
  title: {
    min: 3,
    max: 200,
  },
  description: {
    min: 5,
    max: 1000,
  },
  backgroundImage: {
    fileName: {
      min: 3,
      max: 255,
    },
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.svg'],
  },
  stat: {
    label: {
      min: 1,
      max: 100,
    },
    value: {
      min: 1,
      max: 50,
    },
  },
} as const

const validateHeroStats = (stats: unknown, errors: Record<string, string>): HeroStatRequestDto[] | undefined => {
  if (stats === undefined) {
    return undefined
  }

  if (!Array.isArray(stats)) {
    errors.stats = 'Stats must be an array'
    return undefined
  }

  const validatedStats: HeroStatRequestDto[] = []

  stats.forEach((item, index) => {
    if (typeof item !== 'object' || item === null) {
      errors[`stats[${index}]`] = 'Each statistic must be a valid object'
      return
    }

    const statRecord = item as Record<string, unknown>

    // Label
    if (!statRecord.label || typeof statRecord.label !== 'string') {
      errors[`stats[${index}].label`] = 'Statistic label is required and must be a string'
    } else {
      const trimmedLabel = statRecord.label.trim()
      if (trimmedLabel.length < HERO_VALIDATION_RULES.stat.label.min) {
        errors[`stats[${index}].label`] = `Statistic label must be at least ${HERO_VALIDATION_RULES.stat.label.min} character`
      } else if (trimmedLabel.length > HERO_VALIDATION_RULES.stat.label.max) {
        errors[`stats[${index}].label`] = `Statistic label must not exceed ${HERO_VALIDATION_RULES.stat.label.max} characters`
      }
    }

    // Value
    if (!statRecord.value || typeof statRecord.value !== 'string') {
      errors[`stats[${index}].value`] = 'Statistic value is required and must be a string'
    } else {
      const trimmedValue = statRecord.value.trim()
      if (trimmedValue.length < HERO_VALIDATION_RULES.stat.value.min) {
        errors[`stats[${index}].value`] = `Statistic value must be at least ${HERO_VALIDATION_RULES.stat.value.min} character`
      } else if (trimmedValue.length > HERO_VALIDATION_RULES.stat.value.max) {
        errors[`stats[${index}].value`] = `Statistic value must not exceed ${HERO_VALIDATION_RULES.stat.value.max} characters`
      }
    }

    if (
      typeof statRecord.label === 'string' &&
      typeof statRecord.value === 'string'
    ) {
      validatedStats.push({
        label: (statRecord.label as string).trim(),
        value: (statRecord.value as string).trim(),
      })
    }
  })

  return validatedStats
}

export const validateCreateHero = (
  body: unknown
): {
  valid: boolean
  errors?: Record<string, string>
  data?: CreateHeroRequestDto
} => {
  const errors: Record<string, string> = {}

  if (typeof body !== 'object' || body === null) {
    return {
      valid: false,
      errors: { body: 'Request body must be a valid JSON object' },
    }
  }

  const record = body as Record<string, unknown>

  // Badge
  if (!record.badge || typeof record.badge !== 'string') {
    errors.badge = 'Badge is required and must be a string'
  } else {
    const trimmed = record.badge.trim()
    if (trimmed.length < HERO_VALIDATION_RULES.badge.min) {
      errors.badge = `Badge must be at least ${HERO_VALIDATION_RULES.badge.min} characters`
    } else if (trimmed.length > HERO_VALIDATION_RULES.badge.max) {
      errors.badge = `Badge must not exceed ${HERO_VALIDATION_RULES.badge.max} characters`
    }
  }

  // Title
  if (!record.title || typeof record.title !== 'string') {
    errors.title = 'Title is required and must be a string'
  } else {
    const trimmed = record.title.trim()
    if (trimmed.length < HERO_VALIDATION_RULES.title.min) {
      errors.title = `Title must be at least ${HERO_VALIDATION_RULES.title.min} characters`
    } else if (trimmed.length > HERO_VALIDATION_RULES.title.max) {
      errors.title = `Title must not exceed ${HERO_VALIDATION_RULES.title.max} characters`
    }
  }

  // Description
  if (!record.description || typeof record.description !== 'string') {
    errors.description = 'Description is required and must be a string'
  } else {
    const trimmed = record.description.trim()
    if (trimmed.length < HERO_VALIDATION_RULES.description.min) {
      errors.description = `Description must be at least ${HERO_VALIDATION_RULES.description.min} characters`
    } else if (trimmed.length > HERO_VALIDATION_RULES.description.max) {
      errors.description = `Description must not exceed ${HERO_VALIDATION_RULES.description.max} characters`
    }
  }

  // Background Image
  if (!record.backgroundImage || typeof record.backgroundImage !== 'object' || record.backgroundImage === null) {
    errors.backgroundImage = 'Background image is required and must be an object with file and fileName properties'
  } else {
    const imgObj = record.backgroundImage as Record<string, unknown>
    if (!imgObj.file || typeof imgObj.file !== 'string') {
      errors['backgroundImage.file'] = 'Background image file is required and must be a string'
    } else if (imgObj.file.trim().length === 0) {
      errors['backgroundImage.file'] = 'Background image file cannot be empty'
    }

    if (!imgObj.fileName || typeof imgObj.fileName !== 'string') {
      errors['backgroundImage.fileName'] = 'Background image fileName is required and must be a string'
    } else {
      const trimmed = imgObj.fileName.trim()
      if (trimmed.length < HERO_VALIDATION_RULES.backgroundImage.fileName.min) {
        errors['backgroundImage.fileName'] = `File name must be at least ${HERO_VALIDATION_RULES.backgroundImage.fileName.min} characters`
      } else if (trimmed.length > HERO_VALIDATION_RULES.backgroundImage.fileName.max) {
        errors['backgroundImage.fileName'] = `File name must not exceed ${HERO_VALIDATION_RULES.backgroundImage.fileName.max} characters`
      } else {
        const lower = trimmed.toLowerCase()
        const isValidExt = HERO_VALIDATION_RULES.backgroundImage.allowedExtensions.some((ext) => lower.endsWith(ext))
        if (!isValidExt) {
          errors['backgroundImage.fileName'] = `File extension must be one of: ${HERO_VALIDATION_RULES.backgroundImage.allowedExtensions.join(', ')}`
        }
      }
    }
  }

  // Stats (optional on creation)
  const validatedStats = validateHeroStats(record.stats, errors)

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors }
  }

  const imgRecord = record.backgroundImage as { file: string; fileName: string }

  return {
    valid: true,
    data: {
      badge: (record.badge as string).trim(),
      title: (record.title as string).trim(),
      description: (record.description as string).trim(),
      backgroundImage: {
        file: imgRecord.file.trim(),
        fileName: imgRecord.fileName.trim(),
      },
      stats: validatedStats,
    },
  }
}

export const validateUpdateHero = (
  body: unknown
): {
  valid: boolean
  errors?: Record<string, string>
  data?: UpdateHeroRequestDto
} => {
  const errors: Record<string, string> = {}

  if (typeof body !== 'object' || body === null) {
    return {
      valid: false,
      errors: { body: 'Request body must be a valid JSON object' },
    }
  }

  const record = body as Record<string, unknown>

  const updatableKeys = ['badge', 'title', 'description', 'backgroundImage', 'stats']
  const hasAtLeastOneField = updatableKeys.some((k) => k in record && record[k] !== undefined)
  if (!hasAtLeastOneField) {
    return {
      valid: false,
      errors: { body: 'At least one field (badge, title, description, backgroundImage, or stats) must be provided' },
    }
  }

  // Optional Badge
  if ('badge' in record && record.badge !== undefined) {
    if (typeof record.badge !== 'string') {
      errors.badge = 'Badge must be a string'
    } else {
      const trimmed = record.badge.trim()
      if (trimmed.length < HERO_VALIDATION_RULES.badge.min) {
        errors.badge = `Badge must be at least ${HERO_VALIDATION_RULES.badge.min} characters`
      } else if (trimmed.length > HERO_VALIDATION_RULES.badge.max) {
        errors.badge = `Badge must not exceed ${HERO_VALIDATION_RULES.badge.max} characters`
      }
    }
  }

  // Optional Title
  if ('title' in record && record.title !== undefined) {
    if (typeof record.title !== 'string') {
      errors.title = 'Title must be a string'
    } else {
      const trimmed = record.title.trim()
      if (trimmed.length < HERO_VALIDATION_RULES.title.min) {
        errors.title = `Title must be at least ${HERO_VALIDATION_RULES.title.min} characters`
      } else if (trimmed.length > HERO_VALIDATION_RULES.title.max) {
        errors.title = `Title must not exceed ${HERO_VALIDATION_RULES.title.max} characters`
      }
    }
  }

  // Optional Description
  if ('description' in record && record.description !== undefined) {
    if (typeof record.description !== 'string') {
      errors.description = 'Description must be a string'
    } else {
      const trimmed = record.description.trim()
      if (trimmed.length < HERO_VALIDATION_RULES.description.min) {
        errors.description = `Description must be at least ${HERO_VALIDATION_RULES.description.min} characters`
      } else if (trimmed.length > HERO_VALIDATION_RULES.description.max) {
        errors.description = `Description must not exceed ${HERO_VALIDATION_RULES.description.max} characters`
      }
    }
  }

  // Optional Replacement Background Image
  if ('backgroundImage' in record && record.backgroundImage !== undefined && record.backgroundImage !== null) {
    if (typeof record.backgroundImage !== 'object') {
      errors.backgroundImage = 'Background image must be an object with file and fileName properties'
    } else {
      const imgObj = record.backgroundImage as Record<string, unknown>
      if (!imgObj.file || typeof imgObj.file !== 'string') {
        errors['backgroundImage.file'] = 'Background image file is required and must be a string'
      } else if (imgObj.file.trim().length === 0) {
        errors['backgroundImage.file'] = 'Background image file cannot be empty'
      }

      if (!imgObj.fileName || typeof imgObj.fileName !== 'string') {
        errors['backgroundImage.fileName'] = 'Background image fileName is required and must be a string'
      } else {
        const trimmed = imgObj.fileName.trim()
        if (trimmed.length < HERO_VALIDATION_RULES.backgroundImage.fileName.min) {
          errors['backgroundImage.fileName'] = `File name must be at least ${HERO_VALIDATION_RULES.backgroundImage.fileName.min} characters`
        } else if (trimmed.length > HERO_VALIDATION_RULES.backgroundImage.fileName.max) {
          errors['backgroundImage.fileName'] = `File name must not exceed ${HERO_VALIDATION_RULES.backgroundImage.fileName.max} characters`
        } else {
          const lower = trimmed.toLowerCase()
          const isValidExt = HERO_VALIDATION_RULES.backgroundImage.allowedExtensions.some((ext) => lower.endsWith(ext))
          if (!isValidExt) {
            errors['backgroundImage.fileName'] = `File extension must be one of: ${HERO_VALIDATION_RULES.backgroundImage.allowedExtensions.join(', ')}`
          }
        }
      }
    }
  }

  // Optional Stats
  const validatedStats = 'stats' in record ? validateHeroStats(record.stats, errors) : undefined

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors }
  }

  return {
    valid: true,
    data: {
      badge: typeof record.badge === 'string' ? record.badge.trim() : undefined,
      title: typeof record.title === 'string' ? record.title.trim() : undefined,
      description: typeof record.description === 'string' ? record.description.trim() : undefined,
      backgroundImage: record.backgroundImage
        ? {
            file: (record.backgroundImage as any).file.trim(),
            fileName: (record.backgroundImage as any).fileName.trim(),
          }
        : undefined,
      stats: validatedStats,
    },
  }
}
