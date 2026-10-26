import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  HeroResponse,
  CreateHeroRequest,
  UpdateHeroRequest,
} from '../types/heroTypes'
import type { ReorderRequest } from '../types/commonTypes'

export const heroApi = createApi({
  reducerPath: 'heroApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
    credentials: 'include',
  }),
  tagTypes: ['Hero'],
  endpoints: (builder) => ({
    getHero: builder.query<HeroResponse, void>({
      query: () => '/hero',
      providesTags: ['Hero'],
    }),
    createHero: builder.mutation<HeroResponse, CreateHeroRequest>({
      query: (body) => ({
        url: '/hero',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Hero'],
    }),
    updateHero: builder.mutation<HeroResponse, UpdateHeroRequest>({
      query: (body) => ({
        url: '/hero',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Hero'],
    }),
    deleteHero: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/hero',
        method: 'DELETE',
      }),
      invalidatesTags: ['Hero'],
    }),
    reorderHeroStat: builder.mutation<{ message: string }, { id: number; data: ReorderRequest }>({
      query: ({ id, data }) => ({
        url: `/hero/stats/${id}/reorder`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Hero'],
    }),
  }),
})

export const {
  useGetHeroQuery,
  useCreateHeroMutation,
  useUpdateHeroMutation,
  useDeleteHeroMutation,
  useReorderHeroStatMutation,
} = heroApi
