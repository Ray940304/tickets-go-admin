import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {
  DashboardOutlined,
  UserOutlined,
  ProfileOutlined,
  SolutionOutlined,
  LoginOutlined,
  LogoutOutlined
} from '@ant-design/icons'
import { Breadcrumb, Layout, Menu, theme, Avatar, Dropdown } from 'antd'
import Link from 'next/link'
import type { MenuProps } from 'antd'
import Cookies from 'js-cookie'
import { useDispatch } from 'react-redux'
import { resetStore } from '@/store/slices/authSlice'

const { Header, Content, Sider } = Layout

// const items1: MenuProps['items'] = ['1', '2', '3'].map(key => ({
//   key,
//   label: `nav ${key}`
// }))

const items2: MenuProps['items'] = [
  {
    key: 'sub1',
    icon: <DashboardOutlined />,
    label: '活動管理',
    children: [
      { key: '1', label: <Link href='/events'>活動總覽</Link> },
      { key: '2', label: <Link href='/tags'>標籤管理</Link> }
    ]
  },
  {
    key: 'sub2',
    icon: <SolutionOutlined />,
    label: '會員管理',
    children: [{ key: '3', label: '會員列表' }]
  },
  {
    key: 'sub3',
    icon: <ProfileOutlined />,
    label: '訂單管理',
    children: [{ key: '4', label: '訂單列表' }]
  }
]

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter()
  const dispatch = useDispatch()
  const {
    token: { colorBgContainer, borderRadiusLG }
  } = theme.useToken()

  const [username, setUsername] = useState<string | null>(null)
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const [openKeys, setOpenKeys] = useState<string[]>([])
  const [breadcrumbItems, setBreadcrumbItems] = useState<{ title: string }[]>([])

  useEffect(() => {
    const token = Cookies.get('token')
    const username = Cookies.get('username')

    if (token) {
      setUsername(username || '')
    } else {
      setUsername(null)
    }

    const savedSelectedKeys = localStorage.getItem('selectedKeys')
    const savedOpenKeys = localStorage.getItem('openKeys')
    if (savedSelectedKeys) {
      setSelectedKeys(JSON.parse(savedSelectedKeys))
    }
    if (savedOpenKeys) {
      setOpenKeys(JSON.parse(savedOpenKeys))
    }
  }, [])

  const handleLogout = () => {
    setSelectedKeys([])
    setOpenKeys([])
    setBreadcrumbItems([])
    localStorage.removeItem('selectedKeys')
    localStorage.removeItem('openKeys')
    Cookies.remove('token')
    Cookies.remove('username')
    dispatch(resetStore()) // 重置 Redux store
    router.push('/login') // 在登出後重定向到 /login 頁面
  }

  const handleMenuClick = ({ key, keyPath }: { key: string; keyPath: string[] }) => {
    setSelectedKeys([key])
    localStorage.setItem('selectedKeys', JSON.stringify([key]))

    // 更新 Breadcrumb
    const breadcrumb = keyPath.reverse().map(key => {
      const item = items2.find(
        item => item?.key === key || (item as any).children?.some((child: any) => child.key === key)
      )
      if (item && (item as any).children) {
        const child = (item as any).children.find((child: any) => child.key === key)

        return { title: child?.breadcrumb || child?.label }
      }

      return item ? { title: (item as any).label as string } : { title: '' }
    })

    setBreadcrumbItems(breadcrumb)
  }

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys(keys)
    localStorage.setItem('openKeys', JSON.stringify(keys))
  }

  const handleLogoClick = () => {
    setSelectedKeys([])
    setOpenKeys([])
    setBreadcrumbItems([])
    localStorage.removeItem('selectedKeys')
    localStorage.removeItem('openKeys')
    router.push('/home') // 使用 router 進行導航
  }

  const userMenuItems: MenuProps['items'] = username
    ? [
        {
          key: '1',
          label: (
            <a onClick={handleLogout}>
              <LogoutOutlined /> 登出
            </a>
          )
        }
      ]
    : [
        {
          key: '0',
          label: (
            <Link href='/login'>
              <LoginOutlined /> 登入
            </Link>
          )
        }
      ]

  return (
    <Layout style={{ height: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFBF5' }}>
        <img src='/logo.svg' alt='Logo' onClick={handleLogoClick} style={{ cursor: 'pointer' }} />
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
            <a onClick={e => e.preventDefault()}>
              <Avatar style={{ backgroundColor: '#DC4A4B' }} icon={<UserOutlined />} />
              <span style={{ color: '#000', marginLeft: '10px' }}>{username || ''}</span>
            </a>
          </Dropdown>
        </div>
      </Header>
      <Layout>
        <Sider width={200} style={{ background: colorBgContainer }}>
          <Menu
            mode='inline'
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            onClick={handleMenuClick}
            onOpenChange={handleOpenChange}
            style={{ height: '100%', borderRight: 0 }}
            items={items2}
          />
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Breadcrumb
            style={{ margin: '16px 0' }}
            items={[{ title: '首頁' }, ...breadcrumbItems.map(item => ({ title: item.title }))]}
          />
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  )
}

export default AdminLayout
