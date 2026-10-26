export interface TrackRecordStatRequestDto {
  title: string
  value: string
  icon: string
  isActive?: boolean
}

export interface CreateTrackRecordSectionRequestDto {
  badge: string
  title: string
  description: string
  stats?: TrackRecordStatRequestDto[]
}
