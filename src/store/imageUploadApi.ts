import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import Cookies from 'js-cookie'

export const imageUploadApi = createApi({
  reducerPath: 'imageUploadApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
    prepareHeaders: headers => {
      const token = Cookies.get('token')
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }

      return headers
    }
  }),
  endpoints: builder => ({
    uploadEventImage: builder.mutation<any, { eventId: string; file: FormData }>({
      query: ({ eventId, file }) => ({
        url: `image/upload/event/${eventId}`,
        method: 'POST',
        body: file
      })
    }),
    uploadUserImage: builder.mutation<any, { userId: string; file: FormData }>({
      query: ({ userId, file }) => ({
        url: `image/upload/user/${userId}`,
        method: 'POST',
        body: file
      })
    }),
    deleteImage: builder.mutation<any, { imgUrl: string }>({
      query: ({ imgUrl }) => ({
        url: `image/delete`,
        method: 'DELETE',
        body: { imgUrl }
      })
    })
  })
})

export const { useUploadEventImageMutation, useUploadUserImageMutation, useDeleteImageMutation } = imageUploadApi
