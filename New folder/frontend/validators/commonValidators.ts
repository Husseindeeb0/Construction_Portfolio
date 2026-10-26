export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const PHONE_REGEX = /^[+0-9()\-\s]+$/

export const validateRequired = (val: unknown, fieldName: string): string | null => {
  if (val === undefined || val === null || String(val).trim() === '') {
    return `${fieldName} is required`
  }
  return null
}

export const validateLength = (
  val: string,
  min: number,
  max: number,
  fieldName: string
): string | null => {
  const trimmed = val.trim()
  if (trimmed.length < min) {
    return `${fieldName} must be at least ${min} characters long`
  }
  if (trimmed.length > max) {
    return `${fieldName} must not exceed ${max} characters`
  }
  return null
}

export const validateEmail = (val: string): string | null => {
  const trimmed = val.trim()
  if (!trimmed) return 'Email is required'
  if (trimmed.length < 5 || trimmed.length > 254) {
    return 'Email length must be between 5 and 254 characters'
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Invalid email address'
  }
  return null
}

export const validatePhone = (val: string): string | null => {
  const trimmed = val.trim()
  if (!trimmed) return 'Phone number is required'
  if (trimmed.length < 7 || trimmed.length > 30) {
    return 'Phone number must be between 7 and 30 characters'
  }
  if (!PHONE_REGEX.test(trimmed)) {
    return 'Phone number contains invalid characters'
  }
  return null
}

export const validateImagePayload = (
  image: { file?: string; fileName?: string } | null | undefined,
  required = true,
  allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg']
): string | null => {
  if (!image || !image.file) {
    return required ? 'An image file is required' : null
  }
  if (!image.fileName) {
    return 'Image filename is required'
  }
  const lower = image.fileName.toLowerCase()
  const validExt = allowedExtensions.some((ext) => lower.endsWith(ext))
  if (!validExt) {
    return `Supported image extensions: ${allowedExtensions.join(', ')}`
  }
  return null
}
