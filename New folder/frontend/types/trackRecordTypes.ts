export interface TrackRecordStat {
  id: number
  title: string
  value: string
  icon: string
  displayOrder: number
  isActive: boolean
  trackRecordSectionId: number
  createdAt: string
  updatedAt: string
}

export interface TrackRecordSection {
  id: number
  badge: string
  title: string
  description: string
  createdAt: string
  updatedAt: string
  stats: TrackRecordStat[]
}

export interface TrackRecordSectionResponse {
  trackRecordSection: TrackRecordSection | null
}

export interface TrackRecordStatInput {
  id?: number
  title: string
  value: string
  icon: string
  isActive?: boolean
}

export interface CreateTrackRecordSectionRequest {
  badge: string
  title: string
  description: string
  stats?: TrackRecordStatInput[]
}

export interface UpdateTrackRecordSectionRequest {
  badge?: string
  title?: string
  description?: string
  stats?: TrackRecordStatInput[]
}
