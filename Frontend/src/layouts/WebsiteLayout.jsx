import Footer from '@/pages/attendee/Footer'
import Navbar from '@/pages/attendee/Navbar'
import React from 'react'
import { Outlet } from 'react-router-dom'

const WebsiteLayout = () => {
  return (
    <>
    <Navbar/>
    <Outlet/>
    <Footer/>
    </>
  )
}

export default WebsiteLayout