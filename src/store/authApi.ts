import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://tickets-go-server-dev.onrender.com/api/v1/',
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
      query: () => 'auth/users'
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
