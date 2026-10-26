import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  ProjectCategoriesResponse,
  ProjectCategoryResponse,
  CreateProjectCategoryRequest,
  UpdateProjectCategoryRequest,
} from '../types/projectTypes'
import type { ReorderRequest } from '../types/commonTypes'

export const categoryApi = createApi({
  reducerPath: 'categoryApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
    credentials: 'include',
  }),
  tagTypes: ['Categories', 'Category'],
  endpoints: (builder) => ({
    getProjectCategories: builder.query<ProjectCategoriesResponse, void>({
      query: () => '/categories',
      providesTags: ['Categories'],
    }),
    getProjectCategoryById: builder.query<ProjectCategoryResponse, number>({
      query: (id) => `/categories/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'Category', id }],
    }),
    createProjectCategory: builder.mutation<ProjectCategoryResponse, CreateProjectCategoryRequest>({
      query: (body) => ({
        url: '/categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Categories'],
    }),
    updateProjectCategory: builder.mutation<
      ProjectCategoryResponse,
      { id: number; data: UpdateProjectCategoryRequest }
    >({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Categories'],
    }),
    deleteProjectCategory: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Categories'],
    }),
    reorderProjectCategory: builder.mutation<
      { message: string },
      { id: number; data: ReorderRequest }
    >({
      query: ({ id, data }) => ({
        url: `/categories/${id}/reorder`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Categories'],
    }),
  }),
})

export const {
  useGetProjectCategoriesQuery,
  useGetProjectCategoryByIdQuery,
  useCreateProjectCategoryMutation,
  useUpdateProjectCategoryMutation,
  useDeleteProjectCategoryMutation,
  useReorderProjectCategoryMutation,
} = categoryApi
