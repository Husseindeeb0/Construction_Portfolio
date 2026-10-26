import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  AboutResponse,
  CreateAboutRequest,
  UpdateAboutRequest,
} from '../types/aboutTypes'
import type { ReorderRequest } from '../types/commonTypes'

export const aboutApi = createApi({
  reducerPath: 'aboutApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
    credentials: 'include',
  }),
  tagTypes: ['About'],
  endpoints: (builder) => ({
    getAbout: builder.query<AboutResponse, void>({
      query: () => '/about',
      providesTags: ['About'],
    }),
    createAbout: builder.mutation<AboutResponse, CreateAboutRequest>({
      query: (body) => ({
        url: '/about',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['About'],
    }),
    updateAbout: builder.mutation<AboutResponse, UpdateAboutRequest>({
      query: (body) => ({
        url: '/about',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['About'],
    }),
    deleteAbout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/about',
        method: 'DELETE',
      }),
      invalidatesTags: ['About'],
    }),
    reorderAboutFeature: builder.mutation<{ message: string }, { id: number; data: ReorderRequest }>({
      query: ({ id, data }) => ({
        url: `/about/features/${id}/reorder`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['About'],
    }),
  }),
})

export const {
  useGetAboutQuery,
  useCreateAboutMutation,
  useUpdateAboutMutation,
  useDeleteAboutMutation,
  useReorderAboutFeatureMutation,
} = aboutApi
