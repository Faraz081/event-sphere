import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AdminDashboard from './dashboard/admin/AdminDashboard'
import AdminUsers from './dashboard/admin/AdminUsers'
import AdminAttendees from './dashboard/admin/AdminAttendees'
import ExhibitorPortal from './dashboard/exhibitor/ExhibitorPortal'
import AttendeeHome from './dashboard/attendee/AttendeeHome'
import AdminExpos from './dashboard/admin/AdminExpos'
import AdminBooths from './dashboard/admin/AdminBooths'
import AdminSchedule from './dashboard/admin/AdminSchedule'
import { Toaster } from 'sonner'
import LoginPage from './components/auth/LoginPage'
import RegisterPage from './components/auth/RegisterPage'
import AdminAnalytics from './dashboard/admin/AdminAnalytics'
import AttendeeEvents from './dashboard/attendee/AttendeeEvents'
import AttendeeExhibitors from './dashboard/attendee/AttendeeExhibitors'
import AttendeeProfile from './dashboard/attendee/AttendeeProfile'
import ExhibitorRegistration from './dashboard/exhibitor/ExhibitorRegistration'
import ExhibitorBooth from './dashboard/exhibitor/ExhibitorBooth'
import ExhibitorMessages from './dashboard/exhibitor/ExhibitorMessages'
import ExhibitorProfile from './dashboard/exhibitor/ExhibitorProfile'
import { DashboardRedirect, RequireAuth, RequireRole } from './components/auth/RouteGuards'
import useInitTheme from './hooks/useInitTheme'



function App() {
    useInitTheme();
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
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/dashboard" element={<DashboardRedirect />} />

        <Route element={<RequireRole allowedRoles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/attendees" element={<AdminAttendees />} />
          <Route path="/admin/expos" element={<AdminExpos />} />
          <Route path="/admin/booths" element={<AdminBooths />} />
          <Route path="/admin/schedule" element={<AdminSchedule />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
        </Route>

        <Route element={<RequireRole allowedRoles={["attendee"]} />}>
          <Route path="/attendee" element={<AttendeeHome />} />
          <Route path="/attendee/events" element={<AttendeeEvents />} />
          <Route path="/attendee/exhibitors" element={<AttendeeExhibitors />} />
          <Route path="/attendee/profile" element={<AttendeeProfile />} />
        </Route>

        <Route element={<RequireRole allowedRoles={["exhibitor"]} />}>
          <Route path="/exhibitor" element={<ExhibitorPortal />} />
          <Route path="/exhibitor/registration" element={<ExhibitorRegistration />} />
          <Route path="/exhibitor/booth" element={<ExhibitorBooth />} />
          <Route path="/exhibitor/messages" element={<ExhibitorMessages />} />
          <Route path="/exhibitor/profile" element={<ExhibitorProfile />} />
        </Route>
      </Route>
      
    </Routes>

    </>
  )
}

export default App