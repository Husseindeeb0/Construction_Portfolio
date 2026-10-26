export interface UpdateProjectRequestDto {
  title?: string
  description?: string
  isActive?: boolean
  projectCategoryId?: number
  image?: {
    file: string
    fileName: string
  }
}
