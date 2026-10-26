export interface HeroStatResponseDto {
  id: number
  label: string
  value: string
  displayOrder: number
}

export interface HeroResponseDto {
  id: number
  badge: string
  title: string
  description: string
  backgroundImageUrl: string
  createdAt: Date
  updatedAt: Date
  stats: HeroStatResponseDto[]
}
