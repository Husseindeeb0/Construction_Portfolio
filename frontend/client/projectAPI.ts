import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  ProjectsResponse,
  ProjectResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
} from '../types/projectTypes'
import type { ReorderRequest } from '../types/commonTypes'

export const projectApi = createApi({
  reducerPath: 'projectApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
    credentials: 'include',
  }),
  tagTypes: ['Projects', 'Project'],
  endpoints: (builder) => ({
    getProjects: builder.query<
      ProjectsResponse,
      { page?: number; limit?: number; categoryId?: number | null } | void
    >({
      query: (params) => {
        if (!params) {
          return '/projects'
        }
        const search = new URLSearchParams()
        if (params.page) search.set('page', params.page.toString())
        if (params.limit) search.set('limit', params.limit.toString())
        if (params.categoryId) search.set('categoryId', params.categoryId.toString())
        const qs = search.toString()
        return qs ? `/projects?${qs}` : '/projects'
      },
      providesTags: ['Projects'],
    }),
    getProjectById: builder.query<ProjectResponse, number>({
      query: (id) => `/projects/${id}`,
      providesTags: (_res, _err, id) => [{ type: 'Project', id }],
    }),
    createProject: builder.mutation<ProjectResponse, CreateProjectRequest>({
      query: (body) => ({
        url: '/projects',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Projects'],
    }),
    updateProject: builder.mutation<
      ProjectResponse,
      { id: number; data: UpdateProjectRequest }
    >({
      query: ({ id, data }) => ({
        url: `/projects/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Projects'],
    }),
    deleteProject: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Projects'],
    }),
    reorderProject: builder.mutation<
      { message: string },
      { id: number; data: ReorderRequest }
    >({
      query: ({ id, data }) => ({
        url: `/projects/${id}/reorder`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Projects'],
    }),
  }),
})

export const {
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useReorderProjectMutation,
} = projectApi
