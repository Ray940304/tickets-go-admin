import React from 'react'
import { ConfigProvider } from 'antd'
import type { AppProps } from 'next/app'
import { Provider } from 'react-redux'
import { store } from '@/store/store'

import theme from '@/theme/themeConfig'

const App = ({ Component, pageProps }: AppProps) => (
  <Provider store={store}>
    <ConfigProvider theme={theme}>
      <Component {...pageProps} />
    </ConfigProvider>
  </Provider>
)

export default App
