import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import WebsiteLayout from "./layouts/WebsiteLayout";
import Home from "./pages/attendee/Home";
import EventGallery from "./pages/attendee/EventGallery";
import Service from "./pages/attendee/Service";
import AboutPlatform from "./pages/attendee/AboutPlatform";
import ContactUs from "./pages/attendee/ContactUs";
import OngoingEvents from "./pages/attendee/OngoingEvents";
import BookNow from "./pages/attendee/BookNow";
import BookTicket from "./pages/attendee/BookTicket";
import Feedback from "./pages/attendee/Feedback";
import AttendeeProfile from "./pages/attendee/AttendeeProfile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAttendees from "./pages/admin/AdminAttendees";
import AdminExpos from "./pages/admin/AdminExpos";
import AdminBooths from "./pages/admin/AdminBooths";
import AdminSchedule from "./pages/admin/AdminSchedule";
import AdminWebsiteSettings from "./pages/admin/AdminWebsiteSettings";
import AdminExhibitors from "./pages/admin/AdminExhibitors";
import ExhibitorPortal from "./pages/exhibitor/ExhibitorPortal";
import ExhibitorRegistration from "./pages/exhibitor/ExhibitorRegistration";
import ExhibitorBooth from "./pages/exhibitor/ExhibitorBooth";
import ExhibitorMessages from "./pages/exhibitor/ExhibitorMessages";
import ExhibitorProfile from "./pages/exhibitor/ExhibitorProfile";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyOtp from "./pages/auth/VerifyOtp";
import NewPassword from "./pages/auth/NewPassword";
import { DashboardRedirect, RequireAuth, RequireRole, PublicOnlyRoute } from "./components/shared/RouteGuards";
import { Toaster } from "sonner";
import { useSelector } from "react-redux";
import AdminMessages from "./pages/admin/AdminMessages";
import ExhibitorEvents from "./pages/exhibitor/ExhibitorEvents";
import ExpoDetail from "./pages/attendee/ExpoDetail";
import AdminFeedback from "./pages/admin/AdminFeedback";
import AdminTickets from "./pages/admin/AdminTickets";
import AttendeeMessages from "./pages/attendee/AttendeeMessages";
import AdminEvents from "./pages/admin/AdminEvents";

function App() {
  const { email, otp } = useSelector((state) => state.forgotPassword);

  return (
    <>
      <Toaster theme="system" position="top-right" toastOptions={{
          classNames: {
            toast: "bg-background text-foreground border-border",
            title: "text-foreground",
            description: "text-muted-foreground",
          },
        }} />

       

      <Routes>
        {/* PUBLIC WEBSITE */}
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
          <Route path="expos/:id" element={<ExpoDetail />} />
          <Route path="attendee/messages" element={<AttendeeMessages />} />
          </Route>
        </Route>

        <Route element={<PublicOnlyRoute />}>
         <Route path="/login" element={<LoginPage />} />
         <Route path="/register" element={<RegisterPage />} />
         <Route path="/forgot-password" element={<ForgotPassword />} />
         <Route path="/verify-otp" element={email ? <VerifyOtp /> : <Navigate to="/forgot-password" replace />} />
         <Route path="/new-password" element={ email && otp ? (<NewPassword />) : email ? (<Navigate to="/verify-otp" replace />) : (<Navigate to="/forgot-password" replace />)}/>
        </Route>
        {/* PROTECTED ROUTES */}
        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<DashboardRedirect />} />

          {/* ADMIN */}
          <Route element={<RequireRole allowedRoles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/attendees" element={<AdminAttendees />} />
            <Route path="/admin/expos" element={<AdminExpos />} />
            <Route path="/admin/booths" element={<AdminBooths />} />
            <Route path="/admin/exhibitors" element={<AdminExhibitors />} />
            <Route path="/admin/schedule" element={<AdminSchedule />} />
            <Route path="/admin/website-settings" element={<AdminWebsiteSettings />} />
            <Route path="/admin/messages" element={<AdminMessages />} />
            <Route path="/admin/feedback" element={<AdminFeedback />}/>
            <Route path="/admin/tickets" element={<AdminTickets />} />
            <Route path="/admin/events" element={<AdminEvents />} />
          </Route>

          {/* EXHIBITOR */}
          <Route element={<RequireRole allowedRoles={["exhibitor"]} />}>
            <Route path="/exhibitor" element={<ExhibitorPortal />} />
            <Route path="/exhibitor/registration" element={<ExhibitorRegistration />} />
            <Route path="/exhibitor/booth" element={<ExhibitorBooth />} />
            <Route path="/exhibitor/messages" element={<ExhibitorMessages />} />
            <Route path="/exhibitor/profile" element={<ExhibitorProfile />} />
            <Route path="/exhibitor/events" element={<ExhibitorEvents />}
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
