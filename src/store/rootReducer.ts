import { combineReducers } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import { authApi } from './authApi'
import { tagApi } from './tagApi'

const appReducer = combineReducers({
  auth: authReducer,
  [authApi.reducerPath]: authApi.reducer,
  [tagApi.reducerPath]: tagApi.reducer
})

const rootReducer = (state: any, action: any) => {
  if (action.type === 'RESET_STORE') {
    state = undefined
  }

  return appReducer(state, action)
}

export default rootReducer
