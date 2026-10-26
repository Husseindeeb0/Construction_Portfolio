import {
  CreateTrackRecordSectionRequestDto,
  TrackRecordStatRequestDto
} from '../dtos/requests/createTrackRecordSection.dto.js'
import { UpdateTrackRecordSectionRequestDto } from '../dtos/requests/updateTrackRecordSection.dto.js'

export const TRACK_RECORD_VALIDATION_RULES = {
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
    max: 1500
  },
  stat: {
    title: {
      min: 2,
      max: 100
    },
    value: {
      min: 1,
      max: 50
    },
    icon: {
      min: 2,
      max: 100
    }
  }
} as const

const validateTrackRecordStats = (
  stats: unknown,
  errors: Record<string, string>
): TrackRecordStatRequestDto[] | undefined => {
  if (stats === undefined) {
    return undefined
  }

  if (!Array.isArray(stats)) {
    errors.stats = 'Stats must be an array'
    return undefined
  }

  const validatedStats: TrackRecordStatRequestDto[] = []

  stats.forEach((item, index) => {
    if (typeof item !== 'object' || item === null) {
      errors[`stats[${index}]`] = 'Each statistic must be a valid object'
      return
    }

    const record = item as Record<string, unknown>

    // Title
    if (!record.title || typeof record.title !== 'string') {
      errors[`stats[${index}].title`] = 'Statistic title is required and must be a string'
    } else {
      const trimmedTitle = record.title.trim()
      if (trimmedTitle.length < TRACK_RECORD_VALIDATION_RULES.stat.title.min) {
        errors[`stats[${index}].title`] = `Statistic title must be at least ${TRACK_RECORD_VALIDATION_RULES.stat.title.min} characters`
      } else if (trimmedTitle.length > TRACK_RECORD_VALIDATION_RULES.stat.title.max) {
        errors[`stats[${index}].title`] = `Statistic title must not exceed ${TRACK_RECORD_VALIDATION_RULES.stat.title.max} characters`
      }
    }

    // Value
    if (!record.value || typeof record.value !== 'string') {
      errors[`stats[${index}].value`] = 'Statistic value is required and must be a string'
    } else {
      const trimmedValue = record.value.trim()
      if (trimmedValue.length < TRACK_RECORD_VALIDATION_RULES.stat.value.min) {
        errors[`stats[${index}].value`] = `Statistic value must be at least ${TRACK_RECORD_VALIDATION_RULES.stat.value.min} character`
      } else if (trimmedValue.length > TRACK_RECORD_VALIDATION_RULES.stat.value.max) {
        errors[`stats[${index}].value`] = `Statistic value must not exceed ${TRACK_RECORD_VALIDATION_RULES.stat.value.max} characters`
      }
    }

    // Icon
    if (!record.icon || typeof record.icon !== 'string') {
      errors[`stats[${index}].icon`] = 'Statistic icon is required and must be a string'
    } else {
      const trimmedIcon = record.icon.trim()
      if (trimmedIcon.length < TRACK_RECORD_VALIDATION_RULES.stat.icon.min) {
        errors[`stats[${index}].icon`] = `Statistic icon must be at least ${TRACK_RECORD_VALIDATION_RULES.stat.icon.min} characters`
      } else if (trimmedIcon.length > TRACK_RECORD_VALIDATION_RULES.stat.icon.max) {
        errors[`stats[${index}].icon`] = `Statistic icon must not exceed ${TRACK_RECORD_VALIDATION_RULES.stat.icon.max} characters`
      }
    }

    if (
      typeof record.title === 'string' &&
      typeof record.value === 'string' &&
      typeof record.icon === 'string'
    ) {
      validatedStats.push({
        title: (record.title as string).trim(),
        value: (record.value as string).trim(),
        icon: (record.icon as string).trim(),
        isActive: typeof record.isActive === 'boolean' ? record.isActive : true
      })
    }
  })

  return validatedStats
}

export const validateCreateTrackRecordSection = (
  body: unknown
): {
  valid: boolean
  errors?: Record<string, string>
  data?: CreateTrackRecordSectionRequestDto
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
    if (trimmed.length < TRACK_RECORD_VALIDATION_RULES.badge.min) {
      errors.badge = `Badge must be at least ${TRACK_RECORD_VALIDATION_RULES.badge.min} characters`
    } else if (trimmed.length > TRACK_RECORD_VALIDATION_RULES.badge.max) {
      errors.badge = `Badge must not exceed ${TRACK_RECORD_VALIDATION_RULES.badge.max} characters`
    }
  }

  // Title
  if (!record.title || typeof record.title !== 'string') {
    errors.title = 'Title is required and must be a string'
  } else {
    const trimmed = record.title.trim()
    if (trimmed.length < TRACK_RECORD_VALIDATION_RULES.title.min) {
      errors.title = `Title must be at least ${TRACK_RECORD_VALIDATION_RULES.title.min} characters`
    } else if (trimmed.length > TRACK_RECORD_VALIDATION_RULES.title.max) {
      errors.title = `Title must not exceed ${TRACK_RECORD_VALIDATION_RULES.title.max} characters`
    }
  }

  // Description
  if (!record.description || typeof record.description !== 'string') {
    errors.description = 'Description is required and must be a string'
  } else {
    const trimmed = record.description.trim()
    if (trimmed.length < TRACK_RECORD_VALIDATION_RULES.description.min) {
      errors.description = `Description must be at least ${TRACK_RECORD_VALIDATION_RULES.description.min} characters`
    } else if (trimmed.length > TRACK_RECORD_VALIDATION_RULES.description.max) {
      errors.description = `Description must not exceed ${TRACK_RECORD_VALIDATION_RULES.description.max} characters`
    }
  }

  // Stats (optional on creation)
  const validatedStats = validateTrackRecordStats(record.stats, errors)

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors }
  }

  return {
    valid: true,
    data: {
      badge: (record.badge as string).trim(),
      title: (record.title as string).trim(),
      description: (record.description as string).trim(),
      stats: validatedStats
    }
  }
}

export const validateUpdateTrackRecordSection = (
  body: unknown
): {
  valid: boolean
  errors?: Record<string, string>
  data?: UpdateTrackRecordSectionRequestDto
} => {
  const errors: Record<string, string> = {}

  if (typeof body !== 'object' || body === null) {
    return {
      valid: false,
      errors: { body: 'Request body must be a valid JSON object' }
    }
  }

  const record = body as Record<string, unknown>

  const updatableKeys = ['badge', 'title', 'description', 'stats']
  const hasAtLeastOneField = updatableKeys.some((k) => k in record && record[k] !== undefined)
  if (!hasAtLeastOneField) {
    return {
      valid: false,
      errors: {
        body: 'At least one field (badge, title, description, or stats) must be provided'
      }
    }
  }

  // Optional Badge
  if ('badge' in record && record.badge !== undefined) {
    if (typeof record.badge !== 'string') {
      errors.badge = 'Badge must be a string'
    } else {
      const trimmed = record.badge.trim()
      if (trimmed.length < TRACK_RECORD_VALIDATION_RULES.badge.min) {
        errors.badge = `Badge must be at least ${TRACK_RECORD_VALIDATION_RULES.badge.min} characters`
      } else if (trimmed.length > TRACK_RECORD_VALIDATION_RULES.badge.max) {
        errors.badge = `Badge must not exceed ${TRACK_RECORD_VALIDATION_RULES.badge.max} characters`
      }
    }
  }

  // Optional Title
  if ('title' in record && record.title !== undefined) {
    if (typeof record.title !== 'string') {
      errors.title = 'Title must be a string'
    } else {
      const trimmed = record.title.trim()
      if (trimmed.length < TRACK_RECORD_VALIDATION_RULES.title.min) {
        errors.title = `Title must be at least ${TRACK_RECORD_VALIDATION_RULES.title.min} characters`
      } else if (trimmed.length > TRACK_RECORD_VALIDATION_RULES.title.max) {
        errors.title = `Title must not exceed ${TRACK_RECORD_VALIDATION_RULES.title.max} characters`
      }
    }
  }

  // Optional Description
  if ('description' in record && record.description !== undefined) {
    if (typeof record.description !== 'string') {
      errors.description = 'Description must be a string'
    } else {
      const trimmed = record.description.trim()
      if (trimmed.length < TRACK_RECORD_VALIDATION_RULES.description.min) {
        errors.description = `Description must be at least ${TRACK_RECORD_VALIDATION_RULES.description.min} characters`
      } else if (trimmed.length > TRACK_RECORD_VALIDATION_RULES.description.max) {
        errors.description = `Description must not exceed ${TRACK_RECORD_VALIDATION_RULES.description.max} characters`
      }
    }
  }

  // Optional Stats
  const validatedStats =
    'stats' in record ? validateTrackRecordStats(record.stats, errors) : undefined

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors }
  }

  return {
    valid: true,
    data: {
      badge: typeof record.badge === 'string' ? record.badge.trim() : undefined,
      title: typeof record.title === 'string' ? record.title.trim() : undefined,
      description: typeof record.description === 'string' ? record.description.trim() : undefined,
      stats: validatedStats
    }
  }
}
