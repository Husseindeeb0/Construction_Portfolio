export interface ProjectResponseDto {
  id: number
  title: string
  description: string
  imageUrl: string
  displayOrder: number
  isActive: boolean
  projectCategoryId: number
  category?: {
    id: number
    name: string
    displayOrder: number
  }
  createdAt: Date
  updatedAt: Date
}
