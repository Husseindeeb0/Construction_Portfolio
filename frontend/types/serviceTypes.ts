import type { ImageUploadPayload } from './commonTypes'

export interface ServiceItem {
  id: number
  title: string
  description: string
  icon: string
  displayOrder: number
  isActive: boolean
  serviceSectionId: number
  createdAt: string
  updatedAt: string
}

export interface ServiceSection {
  id: number
  title: string
  description: string
  imageUrl: string
  imageText: string
  createdAt: string
  updatedAt: string
  services: ServiceItem[]
}

export interface ServiceSectionResponse {
  serviceSection: ServiceSection | null
}

export interface ServiceItemInput {
  id?: number
  title: string
  description: string
  icon: string
  isActive?: boolean
}

export interface CreateServiceSectionRequest {
  title: string
  description: string
  imageText: string
  image: ImageUploadPayload
  services?: ServiceItemInput[]
}

export interface UpdateServiceSectionRequest {
  title?: string
  description?: string
  imageText?: string
  image?: ImageUploadPayload
  services?: ServiceItemInput[]
}
