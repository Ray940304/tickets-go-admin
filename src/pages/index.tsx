import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { useGetUsersQuery } from '../store/authApi'
import { clearToken } from '@/store/slices/authSlice'
import { useDispatch } from 'react-redux'

import { Button } from 'antd'

interface User {
  id: number
  name: string
}

export default function Home() {
  const { data, isLoading } = useGetUsersQuery()
  const authToken = useSelector((state: any) => state.auth.token)
  const dispatch = useDispatch()
  const router = useRouter()

  const handleLoginClick = () => {
    router.push('/login')
  }

  const handleLogout = async () => {
    try {
      // const result = await logoutUser().unwrap();
      dispatch(clearToken())
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <h1>Welcome to Tickets Go Admin System!!</h1>
      <Button onClick={() => router.push('/tags')}>分類頁</Button>
      {authToken ? (
        <>
          <p>已登入</p>
          <Button onClick={handleLogout}>登出</Button>
          <ul>
            {data?.data?.map((user: User) => (
              <li key={user.id}>{user.name}</li>
            ))}
          </ul>
        </>
      ) : (
        <Button onClick={handleLoginClick}>請登入</Button>
      )}
    </div>
  )
}
