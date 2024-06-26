import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import Cookies from 'js-cookie'

export const tagApi = createApi({
  reducerPath: 'tagApi',
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
    getAllTags: builder.query<any, void>({
      query: () => 'tag/tags'
    }),
    getTagById: builder.query<any, string>({
      query: id => `tag/${id}`
    }),
    createTag: builder.mutation<any, { tagName: string }>({
      query: body => ({
        url: 'tag',
        method: 'POST',
        body
      })
    }),
    updateTag: builder.mutation<any, { id: string; tagName: string; tagStatus: boolean }>({
      query: ({ id, ...body }) => ({
        url: `tag/${id}`,
        method: 'PUT',
        body
      })
    }),
    deleteTag: builder.mutation<any, string>({
      query: id => ({
        url: `tag/${id}`,
        method: 'DELETE'
      })
    })
  })
})

export const {
  useGetAllTagsQuery,
  useGetTagByIdQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation
} = tagApi
