export interface TrackRecordStatResponseDto {
  id: number
  title: string
  value: string
  icon: string
  displayOrder: number
  isActive: boolean
  trackRecordSectionId: number
  createdAt: Date
  updatedAt: Date
}

export interface TrackRecordSectionResponseDto {
  id: number
  badge: string
  title: string
  description: string
  createdAt: Date
  updatedAt: Date
  stats: TrackRecordStatResponseDto[]
}
