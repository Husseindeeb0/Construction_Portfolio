export interface HeroStatRequestDto {
  label: string
  value: string
}

export interface CreateHeroRequestDto {
  badge: string
  title: string
  description: string
  backgroundImage: {
    file: string
    fileName: string
  }
  stats?: HeroStatRequestDto[]
}
