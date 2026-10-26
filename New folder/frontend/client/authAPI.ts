import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  AuthResponse,
  SigninRequest,
  SignupRequest,
  User,
} from '../types/authTypes'

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
    credentials: 'include',
  }),
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    getMe: builder.query<{ user: User }, void>({
      query: () => '/auth/me',
      providesTags: ['Auth'],
    }),
    signin: builder.mutation<AuthResponse, SigninRequest>({
      query: (credentials) => ({
        url: '/auth/signin',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
    signup: builder.mutation<AuthResponse, SignupRequest>({
      query: (data) => ({
        url: '/auth/signup',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Auth'],
    }),
    signout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/auth/signout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),
  }),
})

export const {
  useGetMeQuery,
  useLazyGetMeQuery,
  useSigninMutation,
  useSignupMutation,
  useSignoutMutation,
} = authApi
