import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

/* =========================
   Saim Public Website
========================= */
import WebsiteLayout from './layouts/WebsiteLayout/WebsiteLayout'
import Home from './pages/Landing-page/Home'
import EventGallery from './pages/Landing-page/Event-Gallery'
import Service from './pages/Landing-page/Service'
import AboutPlatform from './pages/Landing-page/About-Platform'
import ContactUs from './pages/Landing-page/ContactUs'
import OngoingEvents from './pages/Landing-page/Onoing-Events'
import BookNow from './pages/Landing-page/Book-Now'
import BookTicket from './pages/Landing-page/Book-Ticket'
import Feedback from './pages/Landing-page/Feedback'
import AttendeeProfile from './pages/attendee/AttendeeProfile'


/* =========================
   Existing Admin
========================= */
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminAttendees from './pages/admin/AdminAttendees'
import AdminExpos from './pages/admin/AdminExpos'
import AdminBooths from './pages/admin/AdminBooths'
import AdminSchedule from './pages/admin/AdminSchedule'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminWebsiteSettings from './pages/admin/AdminWebsiteSettings'
import AdminExhibitors from './pages/admin/AdminExhibitors'

/* =========================
   Existing Attendee
========================= */

/* =========================
   Existing Exhibitor
========================= */
import ExhibitorPortal from './pages/exhibitor/ExhibitorPortal'
import ExhibitorRegistration from './pages/exhibitor/ExhibitorRegistration'
import ExhibitorBooth from './pages/exhibitor/ExhibitorBooth'
import ExhibitorMessages from './pages/exhibitor/ExhibitorMessages'
import ExhibitorProfile from './pages/exhibitor/ExhibitorProfile'

/* =========================
   Auth Pages (pages/auth)
========================= */
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import ForgotPassword from './pages/auth/ForgotPassword'
import VerifyOtp from './pages/auth/VerifyOtp'
import NewPassword from './pages/auth/NewPassword'

import {
  DashboardRedirect,
  RequireAuth,
  RequireRole,
} from './components/auth/RouteGuards'

import { Toaster } from 'sonner'
import useInitTheme from './hooks/useInitTheme'
import { useSelector } from "react-redux";

function App() {
  const { email, otp } = useSelector((state) => state.forgotPassword);
  useInitTheme()

  return (
    <>
      <Toaster
  theme="system"
  position="top-right"
  toastOptions={{
    classNames: {
      toast: "bg-background text-foreground border-border",
      title: "text-foreground",
      description: "text-muted-foreground",
    },
  }}
/>

      <Routes>

        {/* =========================
            PUBLIC WEBSITE
        ========================= */}
        <Route path="/" element={<WebsiteLayout />}>
          <Route index element={<Home />} />
          <Route path="event-gallery" element={<EventGallery />} />
          <Route path="service" element={<Service />} />
          <Route path="about-platform" element={<AboutPlatform />} />
          <Route path="book-now" element={<BookNow />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="contact" element={<ContactUs />} />
          <Route path="ongoing-events" element={<OngoingEvents />} />
          <Route path="book-ticket" element={<BookTicket />} />
          <Route element={<RequireRole allowedRoles={["attendee"]} />}>
            <Route path="profile" element={<AttendeeProfile />} />
          </Route>
        </Route>

        {/* =========================
            AUTH
        ========================= */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={email ? <VerifyOtp /> : <Navigate to="/forgot-password" replace />}/>
        <Route path="/new-password" element={email && otp ? ( <NewPassword /> ) : email ? (
        <Navigate to="/verify-otp" replace /> ) : (
        <Navigate to="/forgot-password" replace />)}/>

        {/* =========================
            PROTECTED ROUTES
        ========================= */}
        <Route element={<RequireAuth />}>

          <Route
            path="/dashboard"
            element={<DashboardRedirect />}
          />

          {/* =========================
              ADMIN
          ========================= */}
          <Route element={<RequireRole allowedRoles={["admin"]} />}>

            <Route
              path="/admin"
              element={<AdminDashboard />}
            />

            <Route
              path="/admin/users"
              element={<AdminUsers />}
            />

            <Route
              path="/admin/attendees"
              element={<AdminAttendees />}
            />

            <Route
              path="/admin/expos"
              element={<AdminExpos />}
            />

            <Route
              path="/admin/booths"
              element={<AdminBooths />}
            />

            <Route
              path="/admin/exhibitors"
              element={<AdminExhibitors />}
            />

            <Route
              path="/admin/schedule"
              element={<AdminSchedule />}
            />

            <Route
              path="/admin/analytics"
              element={<AdminAnalytics />}
            />

            <Route
              path="/admin/website-settings"
              element={<AdminWebsiteSettings />}
            />

          </Route>

          {/* =========================
              EXHIBITOR
          ========================= */}
          <Route element={<RequireRole allowedRoles={["exhibitor"]} />}>

            <Route
              path="/exhibitor"
              element={<ExhibitorPortal />}
            />

            <Route
              path="/exhibitor/registration"
              element={<ExhibitorRegistration />}
            />

            <Route
              path="/exhibitor/booth"
              element={<ExhibitorBooth />}
            />

            <Route
              path="/exhibitor/messages"
              element={<ExhibitorMessages />}
            />

            <Route
              path="/exhibitor/profile"
              element={<ExhibitorProfile />}
            />

          </Route>

        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </>
  )
}

export default App
