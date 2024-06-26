import React from 'react'

const Event = () => (
  <div className='App'>
    <h2>活動總覽</h2>
  </div>
)

const EventPage: React.FC & { layout?: string } = () => <Event />

EventPage.layout = 'admin'

export default EventPage
