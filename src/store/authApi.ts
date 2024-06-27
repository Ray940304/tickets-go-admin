import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth.token
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }

      return headers
    }
  }),
  endpoints: builder => ({
    getUsers: builder.query<any, void>({
      query: () => 'user/users'
    }),
    registerUser: builder.mutation<
      any,
      { name: string; email: string; password: string; passwordConfirm: string; birthday: string }
    >({
      query: body => ({
        url: 'auth/register',
        method: 'POST',
        body
      })
    }),
    loginUser: builder.mutation<any, { email: string; password: string }>({
      query: credentials => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials
      })
    }),
    logoutUser: builder.mutation<any, void>({
      query: () => ({
        url: 'auth/logout',
        method: 'POST'
      })
    })
  })
})

export const { useGetUsersQuery, useRegisterUserMutation, useLoginUserMutation, useLogoutUserMutation } = authApi
