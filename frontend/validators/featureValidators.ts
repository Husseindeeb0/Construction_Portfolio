import {
  validateEmail,
  validateLength,
  validatePhone,
  validateImagePayload,
} from './commonValidators'
import type { CreateCompanyRequest } from '../types/companyProfileTypes'
import type { SigninRequest, SignupRequest } from '../types/authTypes'
import type { CreateHeroRequest } from '../types/heroTypes'
import type { CreateAboutRequest } from '../types/aboutTypes'
import type { CreateServiceSectionRequest } from '../types/serviceTypes'
import type { CreateTrackRecordSectionRequest } from '../types/trackRecordTypes'
import type { CreateProjectCategoryRequest } from '../types/projectTypes'
import type { CreateProjectRequest } from '../types/projectTypes'

export const validateSigninForm = (data: SigninRequest): Record<string, string> => {
  const errors: Record<string, string> = {}
  const emailErr = validateEmail(data.email || '')
  if (emailErr) errors.email = emailErr
  const passErr = validateLength(data.password || '', 6, 100, 'Password')
  if (passErr) errors.password = passErr
  return errors
}

export const validateSignupForm = (data: SignupRequest): Record<string, string> => {
  const errors: Record<string, string> = {}
  const emailErr = validateEmail(data.email || '')
  if (emailErr) errors.email = emailErr
  const passErr = validateLength(data.password || '', 6, 100, 'Password')
  if (passErr) errors.password = passErr
  return errors
}

export const validateCompanyForm = (
  data: Partial<CreateCompanyRequest>,
  isCreate = true
): Record<string, string> => {
  const errors: Record<string, string> = {}
  if (isCreate || data.companyName !== undefined) {
    const err = validateLength(data.companyName || '', 2, 100, 'Company name')
    if (err) errors.companyName = err
  }
  if (isCreate || data.phoneNumber !== undefined) {
    const err = validatePhone(data.phoneNumber || '')
    if (err) errors.phoneNumber = err
  }
  if (isCreate || data.email !== undefined) {
    const err = validateEmail(data.email || '')
    if (err) errors.email = err
  }
  if (isCreate) {
    const err = validateImagePayload(data.logo, true)
    if (err) errors.logo = err
  } else if (data.logo) {
    const err = validateImagePayload(data.logo, false)
    if (err) errors.logo = err
  }
  return errors
}

export const validateHeroForm = (
  data: Partial<CreateHeroRequest>,
  isCreate = true
): Record<string, string> => {
  const errors: Record<string, string> = {}
  if (isCreate || data.badge !== undefined) {
    const err = validateLength(data.badge || '', 2, 50, 'Badge')
    if (err) errors.badge = err
  }
  if (isCreate || data.title !== undefined) {
    const err = validateLength(data.title || '', 3, 150, 'Title')
    if (err) errors.title = err
  }
  if (isCreate || data.description !== undefined) {
    const err = validateLength(data.description || '', 5, 500, 'Description')
    if (err) errors.description = err
  }
  if (isCreate) {
    const err = validateImagePayload(data.backgroundImage, true)
    if (err) errors.backgroundImage = err
  } else if (data.backgroundImage) {
    const err = validateImagePayload(data.backgroundImage, false)
    if (err) errors.backgroundImage = err
  }
  return errors
}

export const validateAboutForm = (
  data: Partial<CreateAboutRequest>,
  isCreate = true
): Record<string, string> => {
  const errors: Record<string, string> = {}
  if (isCreate || data.badge !== undefined) {
    const err = validateLength(data.badge || '', 2, 50, 'Badge')
    if (err) errors.badge = err
  }
  if (isCreate || data.title !== undefined) {
    const err = validateLength(data.title || '', 3, 150, 'Title')
    if (err) errors.title = err
  }
  if (isCreate || data.description !== undefined) {
    const err = validateLength(data.description || '', 5, 1000, 'Description')
    if (err) errors.description = err
  }
  if (isCreate) {
    const err1 = validateImagePayload(data.primaryImage, true)
    if (err1) errors.primaryImage = err1
    const err2 = validateImagePayload(data.secondaryImage, true)
    if (err2) errors.secondaryImage = err2
  } else {
    if (data.primaryImage) {
      const err = validateImagePayload(data.primaryImage, false)
      if (err) errors.primaryImage = err
    }
    if (data.secondaryImage) {
      const err = validateImagePayload(data.secondaryImage, false)
      if (err) errors.secondaryImage = err
    }
  }
  return errors
}

export const validateServiceSectionForm = (
  data: Partial<CreateServiceSectionRequest>,
  isCreate = true
): Record<string, string> => {
  const errors: Record<string, string> = {}
  if (isCreate || data.title !== undefined) {
    const err = validateLength(data.title || '', 3, 150, 'Title')
    if (err) errors.title = err
  }
  if (isCreate || data.description !== undefined) {
    const err = validateLength(data.description || '', 5, 1000, 'Description')
    if (err) errors.description = err
  }
  if (isCreate || data.imageText !== undefined) {
    const err = validateLength(data.imageText || '', 2, 200, 'Image caption text')
    if (err) errors.imageText = err
  }
  if (isCreate) {
    const err = validateImagePayload(data.image, true)
    if (err) errors.image = err
  } else if (data.image) {
    const err = validateImagePayload(data.image, false)
    if (err) errors.image = err
  }
  return errors
}

export const validateTrackRecordForm = (
  data: Partial<CreateTrackRecordSectionRequest>,
  isCreate = true
): Record<string, string> => {
  const errors: Record<string, string> = {}
  if (isCreate || data.badge !== undefined) {
    const err = validateLength(data.badge || '', 2, 50, 'Badge')
    if (err) errors.badge = err
  }
  if (isCreate || data.title !== undefined) {
    const err = validateLength(data.title || '', 3, 150, 'Title')
    if (err) errors.title = err
  }
  if (isCreate || data.description !== undefined) {
    const err = validateLength(data.description || '', 5, 1000, 'Description')
    if (err) errors.description = err
  }
  return errors
}

export const validateCategoryForm = (
  data: Partial<CreateProjectCategoryRequest>
): Record<string, string> => {
  const errors: Record<string, string> = {}
  const err = validateLength(data.name || '', 2, 100, 'Category name')
  if (err) errors.name = err
  return errors
}

export const validateProjectForm = (
  data: Partial<CreateProjectRequest>,
  isCreate = true
): Record<string, string> => {
  const errors: Record<string, string> = {}
  if (isCreate || data.title !== undefined) {
    const err = validateLength(data.title || '', 3, 150, 'Title')
    if (err) errors.title = err
  }
  if (isCreate || data.description !== undefined) {
    const err = validateLength(data.description || '', 5, 2000, 'Description')
    if (err) errors.description = err
  }
  if (isCreate || data.projectCategoryId !== undefined) {
    if (!data.projectCategoryId || data.projectCategoryId <= 0) {
      errors.projectCategoryId = 'Project category is required'
    }
  }
  if (isCreate) {
    const err = validateImagePayload(data.image, true)
    if (err) errors.image = err
  } else if (data.image) {
    const err = validateImagePayload(data.image, false)
    if (err) errors.image = err
  }
  return errors
}
