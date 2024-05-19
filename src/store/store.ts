// 假設 authSlice 被導入於同一目錄下的 authSlice.ts 文件
import { configureStore } from '@reduxjs/toolkit'
import { authApi } from './authApi'
import authReducer from './slices/authSlice' // 引入 authSlice

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(authApi.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
