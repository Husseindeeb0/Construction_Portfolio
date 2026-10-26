import { ServiceItemRequestDto } from './createServiceSection.dto.js'

export interface UpdateServiceSectionRequestDto {
  title?: string
  description?: string
  imageText?: string
  image?: {
    file: string
    fileName: string
  }
  services?: ServiceItemRequestDto[]
}
