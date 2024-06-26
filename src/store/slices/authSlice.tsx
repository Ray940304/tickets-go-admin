import { createSlice } from '@reduxjs/toolkit'

type AuthState = {
  token: string | null
  isLogin: boolean
}

const initialState: AuthState = {
  token: '',
  isLogin: false
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload
      state.isLogin = true
    },
    clearToken: state => {
      state.token = ''
      state.isLogin = false
    },
    resetStore: () => initialState
  }
})

export const { setToken, clearToken, resetStore } = authSlice.actions

export default authSlice.reducer
