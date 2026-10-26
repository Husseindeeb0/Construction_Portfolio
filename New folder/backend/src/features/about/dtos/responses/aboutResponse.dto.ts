export interface AboutFeatureItemResponseDto {
  id: number
  title: string
  description: string
  icon: string
  displayOrder: number
  isActive: boolean
  aboutId: number
  createdAt?: Date
  updatedAt?: Date
}

export interface AboutResponseDto {
  id: number
  badge: string
  title: string
  description: string
  primaryImageUrl: string
  secondaryImageUrl: string
  createdAt: Date
  updatedAt: Date
  features: AboutFeatureItemResponseDto[]
}
