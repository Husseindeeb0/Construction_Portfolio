import { TrackRecordStatRequestDto } from './createTrackRecordSection.dto.js'

export interface UpdateTrackRecordSectionRequestDto {
  badge?: string
  title?: string
  description?: string
  stats?: TrackRecordStatRequestDto[]
}
