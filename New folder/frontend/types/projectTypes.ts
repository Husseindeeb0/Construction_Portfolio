import type { ImageUploadPayload } from './commonTypes'

export interface ProjectCategoryBrief {
  id: number
  name: string
  displayOrder: number
}

export interface ProjectCategory {
  id: number
  name: string
  displayOrder: number
  createdAt: string
  updatedAt: string
  _count?: {
    projects: number
  }
}

export interface ProjectCategoriesResponse {
  categories: ProjectCategory[]
}

export interface ProjectCategoryResponse {
  category: ProjectCategory
}

export interface CreateProjectCategoryRequest {
  name: string
}

export interface UpdateProjectCategoryRequest {
  name?: string
}

export interface Project {
  id: number
  title: string
  description: string
  imageUrl: string
  displayOrder: number
  isActive: boolean
  projectCategoryId: number
  category?: ProjectCategoryBrief
  createdAt: string
  updatedAt: string
}

export interface ProjectsResponse {
  projects: Project[]
  totalItems?: number
  currentPage?: number
  totalPages?: number
  pageSize?: number
}

export interface ProjectResponse {
  project: Project
}

export interface CreateProjectRequest {
  title: string
  description: string
  projectCategoryId: number
  isActive?: boolean
  image: ImageUploadPayload
}

export interface UpdateProjectRequest {
  title?: string
  description?: string
  projectCategoryId?: number
  isActive?: boolean
  image?: ImageUploadPayload
}
