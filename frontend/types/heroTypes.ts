import type { ImageUploadPayload } from './commonTypes'

export interface HeroStat {
  id: number
  label: string
  value: string
  displayOrder: number
}

export interface HeroSection {
  id: number
  badge: string
  title: string
  description: string
  backgroundImageUrl: string
  createdAt: string
  updatedAt: string
  stats: HeroStat[]
}

export interface HeroResponse {
  hero: HeroSection | null
}

export interface HeroStatInput {
  id?: number
  label: string
  value: string
}

export interface CreateHeroRequest {
  badge: string
  title: string
  description: string
  backgroundImage: ImageUploadPayload
  stats?: HeroStatInput[]
}

export interface UpdateHeroRequest {
  badge?: string
  title?: string
  description?: string
  backgroundImage?: ImageUploadPayload
  stats?: HeroStatInput[]
}
