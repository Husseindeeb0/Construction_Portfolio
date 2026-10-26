export interface ServiceItemRequestDto {
  title: string
  description: string
  icon: string
  isActive?: boolean
}

export interface CreateServiceSectionRequestDto {
  title: string
  description: string
  imageText: string
  image: {
    file: string
    fileName: string
  }
  services?: ServiceItemRequestDto[]
}
