import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
const WebsiteLayout = lazy(() => import("./layouts/WebsiteLayout"));
const Home = lazy(() => import("./pages/attendee/Home"));
const EventGallery = lazy(() => import("./pages/attendee/EventGallery"));
const Service = lazy(() => import("./pages/attendee/Service"));
const Service1 = lazy(() => import("./pages/attendee/Service1"));
const AboutPlatform = lazy(() => import("./pages/attendee/AboutPlatform"));
const ContactUs = lazy(() => import("./pages/attendee/ContactUs"));
const OngoingEvents = lazy(() => import("./pages/attendee/OngoingEvents"));
const BookNow = lazy(() => import("./pages/attendee/BookNow"));
const BookTicket = lazy(() => import("./pages/attendee/BookTicket"));
const Feedback = lazy(() => import("./pages/attendee/Feedback"));
const AttendeeProfile = lazy(() => import("./pages/attendee/AttendeeProfile"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminAttendees = lazy(() => import("./pages/admin/AdminAttendees"));
const AdminExpos = lazy(() => import("./pages/admin/AdminExpos"));
const AdminBooths = lazy(() => import("./pages/admin/AdminBooths"));
const AdminSchedule = lazy(() => import("./pages/admin/AdminSchedule"));
const AdminWebsiteSettings = lazy(() => import("./pages/admin/AdminWebsiteSettings"));
const AdminExhibitors = lazy(() => import("./pages/admin/AdminExhibitors"));
const ExhibitorPortal = lazy(() => import("./pages/exhibitor/ExhibitorPortal"));
const ExhibitorRegistration = lazy(() => import("./pages/exhibitor/ExhibitorRegistration"));
const ExhibitorBooth = lazy(() => import("./pages/exhibitor/ExhibitorBooth"));
const ExhibitorMessages = lazy(() => import("./pages/exhibitor/ExhibitorMessages"));
const ExhibitorProfile = lazy(() => import("./pages/exhibitor/ExhibitorProfile"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const VerifyOtp = lazy(() => import("./pages/auth/VerifyOtp"));
const NewPassword = lazy(() => import("./pages/auth/NewPassword"));
import { DashboardRedirect, RequireAuth, RequireRole, PublicOnlyRoute } from "./components/shared/RouteGuards";
import { Toaster } from "sonner";
import { useSelector } from "react-redux";
import ExhibitorRegistrationForm from "./pages/exhibitor/ExhibitorRegistrationForm";
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));
const ExhibitorEvents = lazy(() => import("./pages/exhibitor/ExhibitorEvents"));
const ExpoDetail = lazy(() => import("./pages/attendee/ExpoDetail"));
const AdminFeedback = lazy(() => import("./pages/admin/AdminFeedback"));
const AdminContactMessages = lazy(() => import("./pages/admin/AdminContactMessages"));
const AdminTickets = lazy(() => import("./pages/admin/AdminTickets"));
const AttendeeMessages = lazy(() => import("./pages/attendee/AttendeeMessages"));
const AdminEvents = lazy(() => import("./pages/admin/AdminEvents"));
const ExhibitorPublicProfile = lazy(() => import("./pages/attendee/ExhibitorPublicProfile"));
const ExhibitorBookings = lazy(() => import("./pages/exhibitor/ExhibitorBookings"));
const CheckInPage = lazy(() => import("./pages/admin/CheckInPage"));

function App() {
  const { email, otp } = useSelector((state) => state.forgotPassword);

  return (
    <>
      <Toaster
        theme="light"
        position="top-right"
        toastOptions={{
          classNames: {
            toast: "border border-[#eadfc9] bg-[#fffdf9] text-[#2f2a24] shadow-lg",
            title: "text-[#2f2a24]",
            description: "text-[#5d574f]",
            success: "border-l-4 border-l-[#c49424]",
            error: "border-l-4 border-l-red-500",
          },
        }}
      />

       

      <Suspense fallback={null}>
      <Routes>
     
        <Route path="/" element={<WebsiteLayout />}>
          <Route index element={<Home />} />
          <Route path="event-gallery" element={<EventGallery />} />
          <Route path="service" element={<Service />} />
          <Route path="service1" element={<Service1 />} />
          <Route path="about-platform" element={<AboutPlatform />} />
          <Route path="book-now" element={<BookNow />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="contact" element={<ContactUs />} />
          <Route path="ongoing-events" element={<OngoingEvents />} />
          <Route path="book-ticket" element={<BookTicket />} />
          <Route path="exhibitors/:id" element={<ExhibitorPublicProfile />} />
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

             <Route path="/check-in/:passCode" element={<CheckInPage />} />
        {/* PROTECTED ROUTES */}
        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<DashboardRedirect />} />


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
            <Route path="/admin/contact-messages" element={<AdminContactMessages />} />
            <Route path="/admin/tickets" element={<AdminTickets />} />
            <Route path="/admin/events" element={<AdminEvents />} />
          </Route>

      
          <Route element={<RequireRole allowedRoles={["exhibitor"]} />}>
            <Route path="/exhibitor" element={<ExhibitorPortal />} />
            <Route path="/exhibitor/registration" element={<ExhibitorRegistration />} />
            <Route path="/exhibitor/registration/new" element={<ExhibitorRegistrationForm />} />
            <Route path="/exhibitor/booth" element={<ExhibitorBooth />} />
            <Route path="/exhibitor/messages" element={<ExhibitorMessages />} />
            <Route path="/exhibitor/profile" element={<ExhibitorProfile />} />
            <Route path="/exhibitor/events" element={<ExhibitorEvents />} />
            <Route path="/exhibitor/bookings" element={<ExhibitorBookings />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </>
  );
}

export default App;
