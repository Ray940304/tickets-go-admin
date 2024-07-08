import { combineReducers } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import { authApi } from './authApi'
import { tagApi } from './tagApi'
import { eventApi } from './eventApi'
import { imageUploadApi } from './imageUploadApi'

const appReducer = combineReducers({
  auth: authReducer,
  [authApi.reducerPath]: authApi.reducer,
  [tagApi.reducerPath]: tagApi.reducer,
  [eventApi.reducerPath]: eventApi.reducer,
  [imageUploadApi.reducerPath]: imageUploadApi.reducer
})

const rootReducer = (state: any, action: any) => {
  if (action.type === 'RESET_STORE') {
    state = undefined
  }

  return appReducer(state, action)
}

export default rootReducer
