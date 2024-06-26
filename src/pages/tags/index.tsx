import React, { useState, useEffect } from 'react'
import {
  useGetAllTagsQuery,
  useCreateTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation
} from '../../store/tagApi'
import { Space, Table, Tag, Button, Modal, Form, Input, Switch, message, Row, Col, Pagination } from 'antd'
import { format } from 'date-fns'

interface DataType {
  key: string
  tagName: string
  tagStatus: boolean
}

const Tags: React.FC = () => {
  const { data, error, isLoading, refetch } = useGetAllTagsQuery()
  const [createTag] = useCreateTagMutation()
  const [updateTag] = useUpdateTagMutation()
  const [deleteTag] = useDeleteTagMutation()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [currentTag, setCurrentTag] = useState<DataType | null>(null)
  const [form] = Form.useForm()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [paginatedData, setPaginatedData] = useState<DataType[]>([])

  useEffect(() => {
    if (data) {
      const start = (currentPage - 1) * pageSize
      const end = start + pageSize
      setPaginatedData(data.data.slice(start, end).map((tag: any) => ({ ...tag, key: tag._id })))
    }
  }, [data, currentPage, pageSize])

  const showModal = (tag?: DataType) => {
    setCurrentTag(tag || null)
    setIsEdit(!!tag)
    form.resetFields()
    if (tag) {
      form.setFieldsValue(tag)
    }
    setIsModalOpen(true)
  }

  const showDeleteModal = (tag: DataType) => {
    setCurrentTag(tag)
    setIsDeleteModalOpen(true)
  }

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      if (isEdit && currentTag) {
        await updateTag({ id: currentTag.key, ...values })
        message.success('標籤已更新')
      } else {
        await createTag(values)
        message.success('標籤已新增')
      }
      setIsModalOpen(false)
      refetch()
    } catch (error) {
      console.error('Failed to save tag:', error)
      message.error('操作失敗，請稍後再試')
    }
  }

  const handleDeleteOk = async () => {
    try {
      if (currentTag) {
        await deleteTag(currentTag.key)
        message.success('標籤已刪除')
        setIsDeleteModalOpen(false)
        refetch()
      }
    } catch (error) {
      console.error('Failed to delete tag:', error)
      message.error('刪除失敗，請稍後再試')
    }
  }

  const handleCancel = () => {
    setIsModalOpen(false)
  }

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false)
  }

  const handleTableChange = (page: number) => {
    setCurrentPage(page)
  }

  const columns = [
    {
      title: '標籤名稱',
      dataIndex: 'tagName',
      key: 'tagName'
    },
    {
      title: '標籤狀態',
      dataIndex: 'tagStatus',
      key: 'tagStatus',
      render: (tagStatus: boolean) => <Tag color={tagStatus ? 'green' : 'red'}>{tagStatus ? '啟用' : '停用'}</Tag>
    },
    {
      title: '上次編輯時間',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (updatedAt: string) => format(new Date(updatedAt), 'yyyy-MM-dd HH:mm:ss')
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: DataType) => (
        <Space size='middle'>
          <Button type='primary' size='small' onClick={() => showModal(record)}>
            編輯
          </Button>
          <Button type='primary' size='small' danger onClick={() => showDeleteModal(record)}>
            刪除
          </Button>
        </Space>
      )
    }
  ]

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Failed to load tags</div>

  return (
    <div>
      <Row justify='space-between' align='middle'>
        <Col>
          <h2>標籤管理</h2>
        </Col>
        <Col>
          <Button type='primary' onClick={() => showModal()}>
            新增標籤
          </Button>
        </Col>
      </Row>
      <Table dataSource={paginatedData} columns={columns} pagination={false} />
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={data?.data.length}
        onChange={handleTableChange}
        style={{ marginTop: '16px', textAlign: 'right' }}
      />
      <Modal title={isEdit ? '編輯標籤' : '新增標籤'} open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <Form form={form} layout='vertical' initialValues={{ tagStatus: true }}>
          <Form.Item name='tagName' label='標籤名稱' rules={[{ required: true, message: '請輸入標籤名稱' }]}>
            <Input />
          </Form.Item>
          <Form.Item name='tagStatus' label='標籤狀態' valuePropName='checked'>
            <Switch checkedChildren='啟用' unCheckedChildren='停用' />
          </Form.Item>
        </Form>
      </Modal>
      <Modal title='確認刪除' open={isDeleteModalOpen} onOk={handleDeleteOk} onCancel={handleDeleteCancel}>
        <p>您確定要刪除此標籤嗎？</p>
      </Modal>
    </div>
  )
}

const TagsPage: React.FC & { layout?: string } = () => <Tags />

TagsPage.layout = 'admin'

export default TagsPage
