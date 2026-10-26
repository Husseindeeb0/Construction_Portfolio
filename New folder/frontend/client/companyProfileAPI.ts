import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  CompanyProfileResponse,
  CreateCompanyRequest,
  UpdateCompanyRequest,
} from '../types/companyProfileTypes'

export const companyProfileApi = createApi({
  reducerPath: 'companyProfileApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
    credentials: 'include',
  }),
  tagTypes: ['CompanyProfile'],
  endpoints: (builder) => ({
    getCompanyProfile: builder.query<CompanyProfileResponse, void>({
      query: () => '/company',
      providesTags: ['CompanyProfile'],
    }),
    createCompanyProfile: builder.mutation<CompanyProfileResponse, CreateCompanyRequest>({
      query: (body) => ({
        url: '/company',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['CompanyProfile'],
    }),
    updateCompanyProfile: builder.mutation<CompanyProfileResponse, UpdateCompanyRequest>({
      query: (body) => ({
        url: '/company',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['CompanyProfile'],
    }),
    deleteCompanyProfile: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/company',
        method: 'DELETE',
      }),
      invalidatesTags: ['CompanyProfile'],
    }),
  }),
})

export const {
  useGetCompanyProfileQuery,
  useCreateCompanyProfileMutation,
  useUpdateCompanyProfileMutation,
  useDeleteCompanyProfileMutation,
} = companyProfileApi
