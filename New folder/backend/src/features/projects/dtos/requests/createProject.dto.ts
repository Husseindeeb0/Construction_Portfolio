export interface CreateProjectRequestDto {
  title: string
  description: string
  isActive?: boolean
  projectCategoryId: number
  image: {
    file: string
    fileName: string
  }
}
