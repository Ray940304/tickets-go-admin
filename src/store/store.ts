import { configureStore } from '@reduxjs/toolkit'
import rootReducer from './rootReducer'
import { authApi } from './authApi'
import { tagApi } from './tagApi'
import { eventApi } from './eventApi'
import { imageUploadApi } from './imageUploadApi'

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(tagApi.middleware)
      .concat(eventApi.middleware)
      .concat(imageUploadApi.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
