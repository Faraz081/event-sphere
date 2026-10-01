import Footer from '@/pages/Landing-page/Footer'
import Navbar from '@/pages/Landing-page/Navbar'
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