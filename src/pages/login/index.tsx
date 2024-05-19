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
        // 假设我们处理一个非HTTP错误
        setErrorMessage('An unknown error occurred')
      }
    } catch (error) {
      // 使用 TypeScript 的类型守卫来检查错误是否是 Error 类型
      if (error instanceof Error) {
        console.error('Failed to login:', error)
        setErrorMessage(error.message || 'Failed to connect to the service')
      } else {
        // 如果不是一个 Error 对象，可能是其他类型的抛出
        console.error('An unexpected error occurred:', error)
        setErrorMessage('An unexpected error occurred')
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
