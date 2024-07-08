import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import Cookies from 'js-cookie'

export const eventApi = createApi({
  reducerPath: 'eventApi',
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
    getAllEvents: builder.query<any, void>({
      query: () => 'event/events'
    }),
    getEventById: builder.query<any, string>({
      query: id => `event/${id}`
    }),
    createEvent: builder.mutation<
      any,
      {
        name: string
        intro: string
        content: string
        introImage: string
        bannerImage: string
        organizer: string
        eventRange: { startDate: number; endDate: number }
        releaseDate: string
        payments: number[]
        tags: string[]
        category: string[]
        sessions: { date: number; timeRange: { startTime: string; endTime: string }; place: string }[]
        prices: { area: string; price: number }[]
      }
    >({
      query: body => ({
        url: 'event',
        method: 'POST',
        body
      })
    }),
    deleteEvents: builder.mutation<any, { eventId: string[] }>({
      query: ({ eventId }) => ({
        url: 'event/events',
        method: 'DELETE',
        body: { eventId }
      })
    })
  })
})

export const { useGetAllEventsQuery, useGetEventByIdQuery, useCreateEventMutation, useDeleteEventsMutation } = eventApi
