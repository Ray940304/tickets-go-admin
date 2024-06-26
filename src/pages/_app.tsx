import React from 'react'
import { ConfigProvider } from 'antd'
import type { AppProps } from 'next/app'
import { Provider } from 'react-redux'
import { store } from '@/store/store'
import theme from '@/theme/themeConfig'
import AdminLayout from '@/components/Layout'

// 擴展 AppProps 類型
type AppPropsWithLayout = AppProps & {
  Component: React.ComponentType & { layout?: string }
}

const App = ({ Component, pageProps }: AppPropsWithLayout) => {
  const Layout = Component.layout === 'admin' ? AdminLayout : React.Fragment

  return (
    <Provider store={store}>
      <ConfigProvider theme={theme}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ConfigProvider>
    </Provider>
  )
}

export default App
