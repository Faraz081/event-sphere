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

/* =========================
   Existing Attendee
========================= */
import AttendeeHome from './pages/attendee/AttendeeHome'
import AttendeeEvents from './pages/attendee/AttendeeEvents'
import AttendeeExhibitors from './pages/attendee/AttendeeExhibitors'
import AttendeeProfile from './pages/attendee/AttendeeProfile'

/* =========================
   Existing Exhibitor
========================= */
import ExhibitorPortal from './pages/exhibitor/ExhibitorPortal'
import ExhibitorRegistration from './pages/exhibitor/ExhibitorRegistration'
import ExhibitorBooth from './pages/exhibitor/ExhibitorBooth'
import ExhibitorMessages from './pages/exhibitor/ExhibitorMessages'
import ExhibitorProfile from './pages/exhibitor/ExhibitorProfile'

/* =========================
   Existing Auth
========================= */
import LoginPage from './components/auth/LoginPage'
import RegisterPage from './components/auth/RegisterPage'

import {
  DashboardRedirect,
  RequireAuth,
  RequireRole,
} from './components/auth/RouteGuards'

import { Toaster } from 'sonner'
import useInitTheme from './hooks/useInitTheme'

function App() {
  useInitTheme()

  return (
    <>
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: "#232733",
            border: "1px solid #2A2E38",
            borderLeft: "4px solid #C9A227",
            color: "#F0EDE4",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
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
        </Route>

        {/* =========================
            AUTH
        ========================= */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

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
              ATTENDEE
          ========================= */}
          <Route element={<RequireRole allowedRoles={["attendee"]} />}>

            <Route
              path="/attendee"
              element={<AttendeeHome />}
            />

            <Route
              path="/attendee/events"
              element={<AttendeeEvents />}
            />

            <Route
              path="/attendee/exhibitors"
              element={<AttendeeExhibitors />}
            />

            <Route
              path="/attendee/profile"
              element={<AttendeeProfile />}
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