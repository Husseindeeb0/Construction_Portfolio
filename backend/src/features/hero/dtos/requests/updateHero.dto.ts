import { HeroStatRequestDto } from './createHero.dto.js'

export interface UpdateHeroRequestDto {
  badge?: string
  title?: string
  description?: string
  backgroundImage?: {
    file: string
    fileName: string
  }
  stats?: HeroStatRequestDto[]
}
