import React, { useState, useEffect } from 'react'
import {
  useGetAllEventsQuery,
  useGetEventByIdQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventsMutation
} from '../../store/eventApi'
import { useGetAllTagsQuery } from '../../store/tagApi'
import { useUploadEventImageMutation } from '../../store/imageUploadApi'
import {
  Space,
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Row,
  Col,
  Pagination,
  Tag,
  DatePicker,
  TimePicker,
  Upload,
  Select,
  Spin
} from 'antd'
import ImgCrop from 'antd-img-crop'
import { UploadOutlined, PlusOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons'
import type { GetProp, UploadFile, UploadProps } from 'antd'
import { format } from 'date-fns'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker
const { Option } = Select

// place data
const placesData = [
  { id: 1, name: '台北小巨蛋' },
  { id: 2, name: '台中國家歌劇院' },
  { id: 3, name: '高雄衛武營國家藝術文化中心' }
]

// seats data
const seatsData = {
  台北小巨蛋: [
    { id: 1, areaName: '特A區', price: 3600, quantity: 50 },
    { id: 2, areaName: '特B區', price: 3200, quantity: 50 },
    { id: 3, areaName: '紅1區', price: 2800, quantity: 100 },
    { id: 4, areaName: '紅2區', price: 2400, quantity: 100 },
    { id: 5, areaName: '綠1區', price: 2000, quantity: 200 },
    { id: 6, areaName: '綠2區', price: 1600, quantity: 200 }
  ]
}

// image folder
const eBanner = 'event-banner'
const eIntro = 'event-intro'

interface EventType {
  key: string
  name: string
  intro: string
  content: string
  eventName: string
  eventIntro: string
  eventContent: string
  introImage: string
  bannerImage: string
  organizer: string
  eventStartDate: string
  eventEndDate: string
  releaseDate: string
  payments: string[]
  tags: string[]
  updatedAt?: string
  sessions?: SessionType[]
  seat?: SeatType[]
}

interface SessionType {
  key: string
  date: string
  startTime: string
  endTime: string
  place: string
}

interface SeatType {
  id: number
  areaName: string
  price: number
  quantity: number
}

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0]

const Events: React.FC = () => {
  const { data: eventsData, error: eventsError, isLoading: eventsLoading, refetch } = useGetAllEventsQuery()
  const { data: tagsData, error: tagsError, isLoading: tagsLoading } = useGetAllTagsQuery()
  const [uploadEventImage] = useUploadEventImageMutation()
  const [createEvent] = useCreateEventMutation()
  const [updateEvent] = useUpdateEventMutation() // 新增的更新事件的 hook
  const [deleteEvent] = useDeleteEventsMutation()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<EventType | null>(null)
  const [currentEventId, setCurrentEventId] = useState<string | null>(null)
  const {
    data: eventDetails,
    isLoading: eventDetailsLoading,
    isError: eventDetailsError
  } = useGetEventByIdQuery(currentEventId ?? '', { skip: !currentEventId })
  const [form] = Form.useForm()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [paginatedData, setPaginatedData] = useState<EventType[]>([])
  const [introImageFileList, setIntroImageFileList] = useState<UploadFile[]>([])
  const [bannerImageFileList, setBannerImageFileList] = useState<UploadFile[]>([])
  const [introImageUrl, setIntroImageUrl] = useState<string | null>(null)
  const [bannerImageUrl, setBannerImageUrl] = useState<string | null>(null)
  const [sessions, setSessions] = useState<SessionType[]>([])
  const [places, setPlaces] = useState<{ id: number; name: string }[]>([])
  const [seats, setSeats] = useState<SeatType[]>([])
  const [spinning, setSpinning] = useState(false)

  useEffect(() => {
    if (eventsData) {
      const start = (currentPage - 1) * pageSize
      const end = start + pageSize
      setPaginatedData(eventsData.data.slice(start, end).map((event: any) => ({ ...event, key: event._id })))
    }
  }, [eventsData, currentPage, pageSize])

  useEffect(() => {
    // get places data
    const fetchPlaces = async () => {
      setPlaces(placesData)
    }

    fetchPlaces()
  }, [])

  useEffect(() => {
    // get seats data
    const fetchSeats = async () => {
      setSeats(seatsData['台北小巨蛋'])
    }

    fetchSeats()
  }, [])

  useEffect(() => {
    const handleRemoveClick = (event: Event) => {
      const button = event.target as HTMLElement
      if (button.closest('.ant-btn-icon-only')) {
        // 清空預覽圖片內容
        setIntroImageUrl(null)
        setBannerImageUrl(null)
      }
    }

    document.addEventListener('click', handleRemoveClick)

    return () => {
      document.removeEventListener('click', handleRemoveClick)
    }
  }, [])

  useEffect(() => {
    if (eventDetails && !eventDetailsLoading && !eventDetailsError) {
      const eventData = eventDetails.data.event
      const sessionsData = eventDetails.data.sessions || []

      console.log('Sessions Data:', sessionsData)

      form.setFieldsValue({
        eventName: eventData.eventName,
        eventIntro: eventData.eventIntro,
        eventContent: eventData.eventContent,
        organizer: eventData.organizer,
        eventRange: [dayjs(eventData.eventStartDate), dayjs(eventData.eventEndDate)],
        tags: eventData.tags,
        payments: eventData.payments,
        sessions: sessionsData.map(session => ({
          date: dayjs(Number(session.startDate)).format('YYYY-MM-DD'),
          timeRange: [dayjs(session.startTime, 'HH:mm'), dayjs(session.endTime, 'HH:mm')],
          place: session.place
        }))
      })

      if (eventData.introImage) {
        setIntroImageFileList([
          {
            uid: '-1',
            name: 'introImage',
            status: 'done',
            url: eventData.introImage
          }
        ])
        setIntroImageUrl(eventData.introImage)
      }

      if (eventData.bannerImage) {
        setBannerImageFileList([
          {
            uid: '-1',
            name: 'bannerImage',
            status: 'done',
            url: eventData.bannerImage
          }
        ])
        setBannerImageUrl(eventData.bannerImage)
      }

      setSessions(
        sessionsData.map(session => ({
          key: session.sessionId,
          date: dayjs(Number(session.startDate)).format('YYYY-MM-DD'),
          startTime: session.startTime,
          endTime: session.endTime,
          place: session.place
        }))
      )

      setSeats(
        sessionsData.length > 0
          ? sessionsData[0].prices.map((price, index) => ({
              id: index,
              areaName: price.area,
              price: price.price,
              quantity: 0 // 如果需要數量，這裡需要更新
            }))
          : []
      )

      setSpinning(false)
    }
  }, [eventDetails, eventDetailsLoading, eventDetailsError])

  const showModal = async (event?: EventType) => {
    if (event) {
      // 編輯模式
      setSpinning(true)
      setCurrentEvent(event)
      setCurrentEventId(event.key)
      setIsEdit(true)
      form.resetFields()
      setIntroImageFileList([])
      setBannerImageFileList([])
      setIntroImageUrl(null)
      setBannerImageUrl(null)
    } else {
      // 新增模式
      setCurrentEvent(null)
      setCurrentEventId(null)
      setIsEdit(false)
      form.resetFields()
      setIntroImageFileList([])
      setBannerImageFileList([])
      setIntroImageUrl(null)
      setBannerImageUrl(null)
      setSessions([])
      setSeats(seatsData['台北小巨蛋'])
    }

    setIsModalOpen(true)
  }

  const showDeleteModal = (event: EventType) => {
    setCurrentEvent(event)
    setIsDeleteModalOpen(true)
  }

  const handleOk = async () => {
    setSpinning(true)
    try {
      const values = await form.validateFields()

      // Transform the eventRange to include startDate and endDate
      const eventRange = {
        startDate: values.eventRange[0].valueOf(),
        endDate: values.eventRange[1].valueOf()
      }

      const sessionsData = sessions.map((session: any) => ({
        date: dayjs(session.date).valueOf(),

        // startTime: session.startTime,
        // endTime: session.endTime,
        timeRange: {
          startTime: dayjs(session.startTime, 'HH:mm').valueOf(),
          endTime: dayjs(session.endTime, 'HH:mm').valueOf()
        },
        place: session.place
      }))

      const prices = seats.map((seat: any) => ({
        area: seat.areaName,
        price: seat.price
      }))

      const payload = {
        name: values.eventName,
        intro: values.eventIntro,
        content: values.eventContent,
        introImage: values.introImage || introImageUrl,
        bannerImage: values.bannerImage || bannerImageUrl,
        organizer: values.organizer,
        eventRange,
        releaseDate: dayjs().valueOf(),
        payments: values.payments,
        tags: values.tags,
        sessions: sessionsData,
        prices
      }

      if (isEdit && currentEvent) {
        // 更新活動
        await updateEvent({ id: currentEvent.key, ...payload }).unwrap()
        message.success('活動已更新')
      } else {
        // 上傳 introImage
        if (introImageFileList.length > 0) {
          const introImageFile = introImageFileList[0].originFileObj
          if (introImageFile) {
            const formData = new FormData()
            formData.append('file', introImageFile)
            const introImageResponse = await uploadEventImage({ eventId: eIntro, file: formData }).unwrap()
            values.introImage = introImageResponse.data.imgUrl
            payload.introImage = values.introImage
          }
        }

        // 上傳 bannerImage
        if (bannerImageFileList.length > 0) {
          const bannerImageFile = bannerImageFileList[0].originFileObj
          if (bannerImageFile) {
            const formData = new FormData()
            formData.append('file', bannerImageFile)
            const bannerImageResponse = await uploadEventImage({ eventId: eBanner, file: formData }).unwrap()
            values.bannerImage = bannerImageResponse.data.imgUrl
            payload.bannerImage = values.bannerImage
          }
        }

        // 創建活動
        console.log('payload:', payload)
        await createEvent(payload).unwrap()
        message.success('活動已新增')
      }
      setIsModalOpen(false)
      refetch()
    } catch (error) {
      console.error('Failed to save event:', error)
      message.error('操作失敗，請稍後再試')
    } finally {
      setSpinning(false)
    }
  }

  const handleDeleteOk = async () => {
    try {
      if (currentEvent) {
        await deleteEvent({
          eventId: [currentEvent.key]
        })
        message.success('活動已刪除')
        setIsDeleteModalOpen(false)
        refetch()
      }
    } catch (error) {
      console.error('Failed to delete event:', error)
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

  const handleIntroImageChange: UploadProps['onChange'] = ({ fileList }) => {
    setIntroImageFileList(fileList)
    const file = fileList[0]
    if (file && file.status === 'done') {
      setIntroImageUrl(file.url || (file.originFileObj ? URL.createObjectURL(file.originFileObj) : null))
    } else {
      setIntroImageUrl(null)
    }
  }

  const onPreview = async (file: UploadFile) => {
    let src = file.url as string
    if (!src) {
      src = await new Promise(resolve => {
        const reader = new FileReader()
        reader.readAsDataURL(file.originFileObj as FileType)
        reader.onload = () => resolve(reader.result as string)
      })
    }
    const image = new Image()
    image.src = src
    const imgWindow = window.open(src)
    imgWindow?.document.write(image.outerHTML)
  }

  const handleBannerImageChange = ({ file, fileList }: { file: UploadFile; fileList: UploadFile[] }) => {
    setBannerImageFileList(fileList)

    if (file.status === 'done') {
      const uploadedUrl = file.response?.url as string
      setBannerImageUrl(uploadedUrl)
      message.success(`${file.name} file uploaded successfully`)
    } else if (file.status === 'error') {
      message.error(`${file.name} file upload failed.`)
    }
  }

  const handlePreview = (file: UploadFile) => {
    const reader = new FileReader()
    reader.readAsDataURL(file.originFileObj as Blob)
    reader.onload = () => {
      const imageURL = reader.result as string
      const newWindow = window.open()
      if (newWindow) {
        newWindow.document.write(`<img src="${imageURL}" alt="Banner Image" />`)
      }
    }
  }

  const columns = [
    {
      title: '活動名稱',
      dataIndex: 'eventName',
      key: 'eventName'
    },
    {
      title: '活動起迄時間',
      key: 'eventRange',
      render: (_: any, record: EventType) => {
        const { eventStartDate, eventEndDate } = record

        return (
          <span>{`${format(new Date(eventStartDate), 'yyyy-MM-dd')} ~ ${format(
            new Date(eventEndDate),
            'yyyy-MM-dd'
          )}`}</span>
        )
      }
    },
    {
      title: '活動標籤',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <>
          {tags.map(tag => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </>
      )
    },
    {
      title: '活動狀態',
      dataIndex: 'releaseDate',
      key: 'releaseDate',
      render: (releaseDate: string) => {
        const isActive = new Date(releaseDate) <= new Date()

        return <Tag color={isActive ? 'green' : 'red'}>{isActive ? '啟用' : '停用'}</Tag>
      }
    },
    {
      title: '上次編輯時間',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (updatedAt: string | undefined) => (updatedAt ? format(new Date(updatedAt), 'yyyy-MM-dd HH:mm:ss') : '')
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: EventType) => (
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

  const handleSessionChange = (index: number, field: string, value: any) => {
    const newSessions = [...sessions]
    if (field === 'timeRange') {
      newSessions[index] = {
        ...newSessions[index],
        startTime: value.startTime,
        endTime: value.endTime
      }
    } else {
      newSessions[index] = {
        ...newSessions[index],
        [field]: value
      }
    }
    setSessions(newSessions)
  }

  const handleAddSession = () => {
    setSessions([
      ...sessions,
      { key: Date.now().toString(), date: '', startTime: '', endTime: '', place: '台北小巨蛋' }
    ])
  }

  const handleDuplicateSession = (index: number) => {
    const newSessions = [...sessions]
    const sessionToDuplicate = { ...newSessions[index], key: Date.now().toString() }
    newSessions.push(sessionToDuplicate)
    setSessions(newSessions)
  }

  const handleDeleteSession = (index: number) => {
    const newSessions = sessions.filter((_, idx) => idx !== index)
    setSessions(newSessions)
  }

  const sessionColumns = [
    {
      title: '演出日期',
      dataIndex: 'date',
      key: 'date',
      render: (_: any, record: SessionType, index: number) => (
        <DatePicker
          value={record.date ? dayjs(record.date) : null}
          onChange={date => handleSessionChange(index, 'date', date ? date.format('YYYY-MM-DD') : '')}
        />
      )
    },
    {
      title: '演出時間',
      dataIndex: 'timeRange',
      key: 'timeRange',
      render: (_: any, record: SessionType, index: number) => (
        <TimePicker.RangePicker
          value={
            record.startTime && record.endTime
              ? [dayjs(record.startTime, 'HH:mm'), dayjs(record.endTime, 'HH:mm')]
              : null
          }
          onChange={time => {
            if (time) {
              handleSessionChange(index, 'timeRange', {
                startTime: time[0]?.format('HH:mm') || '',
                endTime: time[1]?.format('HH:mm') || ''
              })
            }
          }}
        />
      )
    },
    {
      title: '演出地點',
      dataIndex: 'place',
      key: 'place',
      render: (_: any, record: SessionType, index: number) => (
        <Select value={record.place || '台北小巨蛋'} onChange={value => handleSessionChange(index, 'place', value)}>
          {places.map(place => (
            <Option key={place.id} value={place.name}>
              {place.name}
            </Option>
          ))}
        </Select>
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: SessionType, index: number) => (
        <Space size='middle'>
          <Button icon={<CopyOutlined />} onClick={() => handleDuplicateSession(index)} />
          <Button icon={<DeleteOutlined />} onClick={() => handleDeleteSession(index)} danger />
        </Space>
      )
    }
  ]

  const handleSeatChange = (index: number, field: string, value: any) => {
    const newSeats = [...seats]
    newSeats[index] = {
      ...newSeats[index],
      [field]: value
    }
    setSeats(newSeats)
  }

  const handleAddSeat = () => {
    setSeats([...seats, { id: Date.now(), areaName: '', price: 0, quantity: 0 }])
  }

  const handleDuplicateSeat = (index: number) => {
    const newSeats = [...seats]
    const seatToDuplicate = { ...newSeats[index], id: Date.now() }
    newSeats.push(seatToDuplicate)
    setSeats(newSeats)
  }

  const handleDeleteSeat = (index: number) => {
    const newSeats = seats.filter((_, idx) => idx !== index)
    setSeats(newSeats)
  }

  const seatColumns = [
    {
      title: '#',
      key: 'index',
      render: (_: any, __: SeatType, index: number) => <span>{index + 1}</span>
    },
    {
      title: '區域',
      dataIndex: 'areaName',
      key: 'areaName',
      render: (areaName: string, record: SeatType, index: number) => (
        <Input value={record.areaName} onChange={e => handleSeatChange(index, 'areaName', e.target.value)} />
      )
    },
    {
      title: '票價',
      dataIndex: 'price',
      key: 'price',
      render: (price: number, record: SeatType, index: number) => (
        <Input value={record.price} type='number' onChange={e => handleSeatChange(index, 'price', e.target.value)} />
      )
    },
    {
      title: '數量',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number, record: SeatType, index: number) => (
        <Input
          value={record.quantity}
          type='number'
          onChange={e => handleSeatChange(index, 'quantity', e.target.value)}
        />
      )
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: SeatType, index: number) => (
        <Space size='middle'>
          <Button icon={<CopyOutlined />} onClick={() => handleDuplicateSeat(index)} />
          <Button icon={<DeleteOutlined />} onClick={() => handleDeleteSeat(index)} danger />
        </Space>
      )
    }
  ]

  if (eventsLoading || tagsLoading) return <div>Loading...</div>
  if (eventsError || tagsError) return <div>Failed to load data</div>

  return (
    <div>
      <Row justify='space-between' align='middle'>
        <Col>
          <h2>活動管理</h2>
        </Col>
        <Col>
          <Button type='primary' onClick={() => showModal()}>
            新增活動
          </Button>
        </Col>
      </Row>
      <Table dataSource={paginatedData} columns={columns} pagination={false} rowKey='key' />
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={eventsData?.data.length}
        onChange={handleTableChange}
        style={{ marginTop: '16px', textAlign: 'right' }}
      />
      <Modal
        title={isEdit ? '編輯活動' : '新增活動'}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={960}
        okButtonProps={{ disabled: spinning }}
      >
        <Spin spinning={spinning} tip='Loading...'>
          <Form form={form} layout='vertical' initialValues={{}}>
            <Form.Item name='eventName' label='活動名稱' rules={[{ required: true, message: '請輸入活動名稱' }]}>
              <Input />
            </Form.Item>
            <Form.Item name='eventIntro' label='活動簡述' rules={[{ required: true, message: '請輸入活動簡述' }]}>
              <Input />
            </Form.Item>
            <Form.Item name='eventContent' label='活動內容' rules={[{ required: true, message: '請輸入活動內容' }]}>
              <Input.TextArea autoSize={{ minRows: 10, maxRows: 15 }} />
            </Form.Item>
            <Form.Item name='introImage' label='活動縮圖網址' rules={[{ required: true, message: '請上傳活動縮圖' }]}>
              <div>
                <ImgCrop rotationSlider>
                  <Upload
                    listType='picture-card'
                    fileList={introImageFileList}
                    onChange={handleIntroImageChange}
                    onPreview={onPreview}
                    onRemove={() => setIntroImageFileList([])}
                  >
                    {introImageFileList.length < 1 && '+ Upload'}
                  </Upload>
                </ImgCrop>
              </div>
            </Form.Item>
            <Form.Item
              name='bannerImage'
              label='活動橫幅圖網址'
              rules={[{ required: true, message: '請上傳活動橫幅圖' }]}
            >
              <div>
                <Upload
                  listType='picture'
                  fileList={bannerImageFileList}
                  onChange={handleBannerImageChange}
                  onRemove={() => setBannerImageFileList([])}
                  maxCount={1}
                  onPreview={handlePreview}
                >
                  {bannerImageFileList.length < 1 && <Button icon={<UploadOutlined />}>Upload</Button>}
                </Upload>
              </div>
            </Form.Item>
            <Form.Item name='organizer' label='主辦單位' rules={[{ required: true, message: '請輸入主辦單位' }]}>
              <Input />
            </Form.Item>
            <Form.Item name='eventRange' label='販售日期' rules={[{ required: true, message: '請選擇販售日期' }]}>
              <RangePicker showTime />
            </Form.Item>
            <Form.Item name='tags' label='活動標籤' rules={[{ required: true, message: '請選擇活動標籤' }]}>
              <Select mode='multiple'>
                {tagsData?.data.map((tag: any) => (
                  <Option key={tag._id} value={tag.tagName}>
                    {tag.tagName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name='payments' label='提供的付款方式' rules={[{ required: true, message: '請選擇付款方式' }]}>
              <Select mode='multiple'>
                <Option value='信用卡'>信用卡</Option>
                <Option value='現金'>現金(尚未開放)</Option>
                <Option value='第三方支付'>第三方支付(尚未開放)</Option>
              </Select>
            </Form.Item>
            <Form.Item name='sessions' label='場次資訊'>
              <Table
                dataSource={sessions}
                columns={sessionColumns}
                pagination={false}
                rowKey='key'
                footer={() => (
                  <Button onClick={handleAddSession} icon={<PlusOutlined />} block>
                    新增演出資訊
                  </Button>
                )}
              />
            </Form.Item>
            <Form.Item name='seat' label='票價資訊'>
              <Table
                dataSource={seats}
                columns={seatColumns}
                pagination={false}
                rowKey='id'
                footer={() => (
                  <Button onClick={handleAddSeat} icon={<PlusOutlined />} block>
                    新增票價
                  </Button>
                )}
              />
            </Form.Item>
          </Form>
        </Spin>
      </Modal>
      <Modal title='確認刪除' open={isDeleteModalOpen} onOk={handleDeleteOk} onCancel={handleDeleteCancel}>
        <p>您確定要刪除此活動嗎？</p>
      </Modal>
    </div>
  )
}

const EventsPage: React.FC & { layout?: string } = () => <Events />

EventsPage.layout = 'admin'

export default EventsPage
