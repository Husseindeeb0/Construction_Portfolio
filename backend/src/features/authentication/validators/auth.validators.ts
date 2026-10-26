import { SignupRequestDto } from '../dtos/requests/signup.dto.js'
import { SigninRequestDto } from '../dtos/requests/signin.dto.js'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const validateSignup = (
  body: unknown
): {
  valid: boolean
  errors?: Record<string, string>
  data?: SignupRequestDto
} => {
  const errors: Record<string, string> = {}

  if (typeof body !== 'object' || body === null) {
    return {
      valid: false,
      errors: { body: 'Request body must be a valid JSON object' }
    }
  }

  const record = body as Record<string, unknown>

  // Prevent role injection or privilege escalation
  if ('role' in record) {
    errors.role = 'Specifying a role during signup is not permitted'
  }

  // Validate email
  if (!record.email || typeof record.email !== 'string') {
    errors.email = 'Email is required and must be a string'
  } else {
    const trimmedEmail = record.email.trim()
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = 'Invalid email format'
    }
  }

  // Validate password
  if (!record.password || typeof record.password !== 'string') {
    errors.password = 'Password is required and must be a string'
  } else if (record.password.length < 8) {
    errors.password = 'Password must be at least 8 characters long'
  } else if (record.password.length > 128) {
    errors.password = 'Password must not exceed 128 characters'
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors }
  }

  return {
    valid: true,
    data: {
      email: (record.email as string).trim().toLowerCase(),
      password: record.password as string
    }
  }
}

export const validateSignin = (
  body: unknown
): {
  valid: boolean
  errors?: Record<string, string>
  data?: SigninRequestDto
} => {
  const errors: Record<string, string> = {}

  if (typeof body !== 'object' || body === null) {
    return {
      valid: false,
      errors: { body: 'Request body must be a valid JSON object' }
    }
  }

  const record = body as Record<string, unknown>

  if (!record.email || typeof record.email !== 'string') {
    errors.email = 'Email is required and must be a string'
  } else {
    const trimmedEmail = record.email.trim()
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = 'Invalid email format'
    }
  }

  if (!record.password || typeof record.password !== 'string') {
    errors.password = 'Password is required and must be a string'
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors }
  }

  return {
    valid: true,
    data: {
      email: (record.email as string).trim().toLowerCase(),
      password: record.password as string
    }
  }
}
