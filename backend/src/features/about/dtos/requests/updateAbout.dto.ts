import { AboutFeatureItemRequestDto } from './createAbout.dto.js'

export interface UpdateAboutRequestDto {
  badge?: string
  title?: string
  description?: string
  primaryImage?: {
    file: string
    fileName: string
  }
  secondaryImage?: {
    file: string
    fileName: string
  }
  features?: AboutFeatureItemRequestDto[]
}
