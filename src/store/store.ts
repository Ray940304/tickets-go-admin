import { configureStore } from '@reduxjs/toolkit'
import rootReducer from './rootReducer'
import { authApi } from './authApi'
import { tagApi } from './tagApi'

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(authApi.middleware).concat(tagApi.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
