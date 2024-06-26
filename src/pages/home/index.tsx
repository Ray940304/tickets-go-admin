import React, { useEffect, useState } from 'react'
import { Button } from 'antd'
import { useRouter } from 'next/router'
import Cookies from 'js-cookie'

const Home = () => {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = Cookies.get('token')
    if (token) {
      setIsLoggedIn(true)
    } else {
      setIsLoggedIn(false)
    }
  }, [])

  const handleLogin = () => {
    router.push('/login')
  }

  return (
    <div className='App'>
      <h1>Welcome to Tickets Go Admin Dashboard!</h1>
      {!isLoggedIn && (
        <Button type='primary' onClick={handleLogin}>
          登入
        </Button>
      )}
    </div>
  )
}

const HomePage: React.FC & { layout?: string } = () => <Home />

HomePage.layout = 'admin'

export default HomePage
