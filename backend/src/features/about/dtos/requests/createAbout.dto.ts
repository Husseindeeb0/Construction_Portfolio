export interface AboutFeatureItemRequestDto {
  title: string
  description: string
  icon: string
  isActive?: boolean
}

export interface CreateAboutRequestDto {
  badge: string
  title: string
  description: string
  primaryImage: {
    file: string
    fileName: string
  }
  secondaryImage: {
    file: string
    fileName: string
  }
  features?: AboutFeatureItemRequestDto[]
}
