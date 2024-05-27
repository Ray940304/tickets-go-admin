import React, { useState } from 'react'
import { useLoginUserMutation } from '@/store/authApi'
import { useDispatch } from 'react-redux'
import { setToken } from '@/store/slices/authSlice'
import { useRouter } from 'next/router'

import type { FormProps } from 'antd'
import { Typography, Layout, Button, Form, Input } from 'antd'

const { Content } = Layout

type FieldType = {
  email: string
  password: string
}

const Login = () => {
  const [loginUser, { isLoading }] = useLoginUserMutation()
  const dispatch = useDispatch()
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState<string>('')

  const onFinish: FormProps<FieldType>['onFinish'] = async (values: FieldType) => {
    const { email, password } = values
    try {
      const result = await loginUser({ email, password })
      if (result?.data?.data?.accessToken) {
        dispatch(setToken(result.data.data.accessToken))
        router.push('/')
      } else {
        // 處理回應成功卻未取得到 token 的異常錯誤
        setErrorMessage('無法取得驗證 token，請稍後再試')
      }
    } catch (error: unknown) {
      // 更精確的錯誤處理，取得 error.message 提示
      if (error instanceof Error) {
        console.error('登入失敗:', error)
        setErrorMessage(error.message || '無法連接到服務，請稍後再試')
      } else {
        // 非預期的錯誤
        console.error('發生了意外的錯誤:', error)
        setErrorMessage('發生了意外的錯誤，請稍後再試')
      }
    }
  }

  return (
    <Layout>
      <Typography.Title level={3} style={{ textAlign: 'center' }}>
        Login
      </Typography.Title>
      <Content style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
        <Form
          name='basic'
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete='off'
        >
          <Form.Item<FieldType>
            label='Email'
            name='email'
            rules={[{ required: true, message: 'Please input your email!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item<FieldType>
            label='Password'
            name='password'
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type='primary' htmlType='submit' disabled={isLoading}>
              Submit
            </Button>
          </Form.Item>
          {errorMessage !== '' && <p>Error logging in: {errorMessage}</p>}
        </Form>
      </Content>
    </Layout>
  )
}

export default Login
