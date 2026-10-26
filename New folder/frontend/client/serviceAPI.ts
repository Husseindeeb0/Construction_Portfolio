import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  ServiceSectionResponse,
  CreateServiceSectionRequest,
  UpdateServiceSectionRequest,
} from '../types/serviceTypes'
import type { ReorderRequest } from '../types/commonTypes'

export const serviceApi = createApi({
  reducerPath: 'serviceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
    credentials: 'include',
  }),
  tagTypes: ['ServiceSection'],
  endpoints: (builder) => ({
    getServiceSection: builder.query<ServiceSectionResponse, void>({
      query: () => '/services',
      providesTags: ['ServiceSection'],
    }),
    createServiceSection: builder.mutation<ServiceSectionResponse, CreateServiceSectionRequest>({
      query: (body) => ({
        url: '/services',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['ServiceSection'],
    }),
    updateServiceSection: builder.mutation<ServiceSectionResponse, UpdateServiceSectionRequest>({
      query: (body) => ({
        url: '/services',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['ServiceSection'],
    }),
    deleteServiceSection: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/services',
        method: 'DELETE',
      }),
      invalidatesTags: ['ServiceSection'],
    }),
    reorderServiceItem: builder.mutation<{ message: string }, { id: number; data: ReorderRequest }>({
      query: ({ id, data }) => ({
        url: `/services/items/${id}/reorder`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['ServiceSection'],
    }),
  }),
})

export const {
  useGetServiceSectionQuery,
  useCreateServiceSectionMutation,
  useUpdateServiceSectionMutation,
  useDeleteServiceSectionMutation,
  useReorderServiceItemMutation,
} = serviceApi
