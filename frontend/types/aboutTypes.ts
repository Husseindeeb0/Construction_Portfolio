import type { ImageUploadPayload } from './commonTypes'

export interface AboutFeature {
  id: number
  title: string
  description: string
  icon: string
  displayOrder: number
  isActive: boolean
  aboutId: number
  createdAt?: string
  updatedAt?: string
}

export interface AboutSection {
  id: number
  badge: string
  title: string
  description: string
  primaryImageUrl: string
  secondaryImageUrl: string
  createdAt: string
  updatedAt: string
  features: AboutFeature[]
}

export interface AboutResponse {
  about: AboutSection | null
}

export interface AboutFeatureInput {
  id?: number
  title: string
  description: string
  icon: string
  isActive?: boolean
}

export interface CreateAboutRequest {
  badge: string
  title: string
  description: string
  primaryImage: ImageUploadPayload
  secondaryImage: ImageUploadPayload
  features?: AboutFeatureInput[]
}

export interface UpdateAboutRequest {
  badge?: string
  title?: string
  description?: string
  primaryImage?: ImageUploadPayload
  secondaryImage?: ImageUploadPayload
  features?: AboutFeatureInput[]
}
