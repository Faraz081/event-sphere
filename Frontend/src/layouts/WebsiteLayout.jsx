import FeedbackButton from '@/components/shared/FeedbackButton'
import ScrollTopButton from '@/components/shared/ScrollTopButton'
import Footer from '@/pages/attendee/Footer'
import Navbar from '@/pages/attendee/Navbar'
import ScrollToTop from '@/pages/attendee/ScrollToTop'
import React from 'react'
import { Outlet } from 'react-router-dom'

const WebsiteLayout = () => {
  return (
    <>
    <Navbar/>

       <ScrollToTop />

         <FeedbackButton />

         <ScrollTopButton />

    <Outlet/>
    <Footer/>
    </>
  )
}

export default WebsiteLayout