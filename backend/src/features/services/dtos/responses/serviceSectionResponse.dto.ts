export interface ServiceItemResponseDto {
  id: number
  title: string
  description: string
  icon: string
  displayOrder: number
  isActive: boolean
  serviceSectionId: number
  createdAt: Date
  updatedAt: Date
}

export interface ServiceSectionResponseDto {
  id: number
  title: string
  description: string
  imageUrl: string
  imageText: string
  createdAt: Date
  updatedAt: Date
  services: ServiceItemResponseDto[]
}
