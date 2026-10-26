import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  TrackRecordSectionResponse,
  CreateTrackRecordSectionRequest,
  UpdateTrackRecordSectionRequest,
} from '../types/trackRecordTypes'
import type { ReorderRequest } from '../types/commonTypes'

export const trackRecordApi = createApi({
  reducerPath: 'trackRecordApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
    credentials: 'include',
  }),
  tagTypes: ['TrackRecordSection'],
  endpoints: (builder) => ({
    getTrackRecordSection: builder.query<TrackRecordSectionResponse, void>({
      query: () => '/records',
      providesTags: ['TrackRecordSection'],
    }),
    createTrackRecordSection: builder.mutation<TrackRecordSectionResponse, CreateTrackRecordSectionRequest>({
      query: (body) => ({
        url: '/records',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['TrackRecordSection'],
    }),
    updateTrackRecordSection: builder.mutation<TrackRecordSectionResponse, UpdateTrackRecordSectionRequest>({
      query: (body) => ({
        url: '/records',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['TrackRecordSection'],
    }),
    deleteTrackRecordSection: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/records',
        method: 'DELETE',
      }),
      invalidatesTags: ['TrackRecordSection'],
    }),
    reorderTrackRecordStat: builder.mutation<{ message: string }, { id: number; data: ReorderRequest }>({
      query: ({ id, data }) => ({
        url: `/records/stats/${id}/reorder`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['TrackRecordSection'],
    }),
  }),
})

export const {
  useGetTrackRecordSectionQuery,
  useCreateTrackRecordSectionMutation,
  useUpdateTrackRecordSectionMutation,
  useDeleteTrackRecordSectionMutation,
  useReorderTrackRecordStatMutation,
} = trackRecordApi
