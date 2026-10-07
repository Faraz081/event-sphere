import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import {
  Building2,
  CalendarDays,
  Mail,
  Phone,
  UserRound,
  Ticket,
  MapPin,
  Store,
  CheckCircle2,
  Clock3,
  XCircle,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { fetchMyRegistrations } from "@/api/attendeePortalService";
import EntryPass from "@/components/shared/EntryPass";

const ProfileDetail = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 rounded-xl border border-[#eadfc9]/50 bg-[#fffdf9] p-3 shadow-2xs">
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2f2a24] text-[#e3b94a]">
      <Icon size={15} />
    </span>
    <div className="min-w-0">
      <p className="text-[9px] font-bold uppercase tracking-widest text-[#8a8379]">
        {label}
      </p>
      <p className="truncate text-xs font-bold text-[#2f2a24]">
        {value || "Not provided"}
      </p>
    </div>
  </div>
);

const bookingBadge = {
  pending: {
    label: "Pending Approval",
    className: "bg-amber-100 text-amber-800 border-amber-300",
    bar: "bg-amber-400",
    icon: Clock3,
  },
  confirmed: {
    label: "Confirmed Pass",
    className: "bg-emerald-100 text-emerald-800 border-emerald-300",
    bar: "bg-emerald-500",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Rejected",
    className: "bg-rose-100 text-rose-800 border-rose-300",
    bar: "bg-rose-400",
    icon: XCircle,
  },
};

const AttendeeProfile = () => {
  const user = useSelector((state) => state.auth.user);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const initials = user?.name
    ? user.name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "G";

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMyRegistrations();
        setBookings(data.registrations ?? []);
      } catch (err) {
        toast.error(
          err.response?.data?.error || "Could not load your bookings"
        );
      } finally {
        setLoadingBookings(false);
      }
    };

    load();
  }, []);

  const confirmedCount = bookings.filter((b) => b.bookingStatus === "confirmed").length;
  const pendingCount = bookings.filter((b) => b.bookingStatus === "pending").length;

  return (
    <main className="min-h-screen bg-[#f8f5ef] px-4 pb-20 pt-28 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl space-y-8">
        
        {/* Profile Card Header */}
        <div className="relative overflow-hidden rounded-3xl border border-[#eadfc9] bg-[#fffdf9] p-6 sm:p-8 shadow-sm">
          <div className="absolute top-0 left-0 h-2 w-full bg-gradient-to-r from-[#2f2a24] via-[#c49424] to-[#2f2a24]" />
          
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-20 w-20 rounded-2xl border-2 border-[#c49424] object-cover shadow-md"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-[#c49424] bg-[#2f2a24] font-serif text-2xl font-bold text-[#e3b94a] shadow-md">
                  {initials}
                </div>
              )}

              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="font-serif text-2xl font-bold text-[#2f2a24] sm:text-3xl">
                    {user?.name}
                  </h1>
                  <ShieldCheck className="h-5 w-5 text-[#c49424]" />
                </div>
                <p className="text-xs text-[#736c62]">{user?.email}</p>
                <span className="mt-2 inline-block rounded-md bg-[#c49424]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#a8790d]">
                  {user?.role || "Attendee"}
                </span>
              </div>
            </div>

            {/* Quick Stats Banner */}
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-[#eadfc9] bg-[#f8f5ef] p-3">
              <div className="px-4 text-center border-r border-[#eadfc9]">
                <p className="font-serif text-xl font-bold text-[#2f2a24]">{bookings.length}</p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#8a8379]">Total</p>
              </div>
              <div className="px-4 text-center border-r border-[#eadfc9]">
                <p className="font-serif text-xl font-bold text-emerald-700">{confirmedCount}</p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#8a8379]">Approved</p>
              </div>
              <div className="px-4 text-center">
                <p className="font-serif text-xl font-bold text-amber-700">{pendingCount}</p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#8a8379]">Pending</p>
              </div>
            </div>
          </div>

          {/* User Info Details Row */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 border-t border-[#f0e8d8] pt-6">
            <ProfileDetail icon={UserRound} label="Full name" value={user?.name} />
            <ProfileDetail icon={Mail} label="Email" value={user?.email} />
            <ProfileDetail icon={Phone} label="Phone" value={user?.phone} />
            <ProfileDetail icon={Building2} label="Organization" value={user?.companyName} />
          </div>
        </div>

        {/* Bookings Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Ticket size={20} className="text-[#c49424]" />
            <h2 className="font-serif text-2xl font-bold text-[#2f2a24]">My Passes & Tickets</h2>
          </div>

          {loadingBookings && (
            <p className="text-xs font-semibold text-[#5d574f]">
              Loading your passes...
            </p>
          )}

          {!loadingBookings && bookings.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#d9c9a3] bg-white/80 p-12 text-center">
              <Ticket size={32} className="text-[#c49424]" />
              <p className="mt-3 font-serif text-base font-semibold text-[#2f2a24]">
                No event bookings found
              </p>
              <p className="text-xs text-[#736c62]">
                Your registered passes will appear here.
              </p>
            </div>
          )}

          {/* PASS TICKETS GRID / LIST */}
          <div className="space-y-5">
            {bookings.map((b) => {
              const badge = bookingBadge[b.bookingStatus] ?? bookingBadge.pending;
              const BadgeIcon = badge.icon;
              const title = b.event?.title ?? b.eventName ?? b.expo?.title ?? "Event Registration";
              const date = b.event?.date ?? b.expo?.date;
              const expoTitle = b.event?.expo?.title ?? b.expo?.title;
              const isExpoTicket = !b.event && !!b.expo;
              const location = b.event?.expo?.location ?? b.expo?.location;

              return (
                <div
                  key={b._id}
                  className="relative flex flex-col md:flex-row rounded-2xl border border-[#eadfc9] bg-[#fffdf9] shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md"
                >
                  {/* LEFT PASS BODY */}
                  <div className="flex-1 p-5 sm:p-6">
                    {/* Header bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f0e8d8] pb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#a8790d]">
                        {isExpoTicket ? "Official Expo Pass" : "Exhibitor Ticket"}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-[11px] font-bold ${badge.className}`}>
                        <BadgeIcon size={12} />
                        {badge.label}
                      </span>
                    </div>

                    {/* Title & Expo */}
                    <div className="mt-3">
                      <h3 className="font-serif text-xl font-bold text-[#2f2a24]">
                        {title}
                      </h3>
                      {expoTitle && title !== expoTitle && (
                        <p className="text-xs text-[#736c62] mt-0.5">
                          Expo: <span className="font-semibold text-[#2f2a24]">{expoTitle}</span>
                        </p>
                      )}
                    </div>

                    {/* Event Details Badges */}
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#5d574f]">
                      {date && (
                        <span className="flex items-center gap-1.5 rounded-lg bg-[#f8f5ef] px-3 py-1.5 font-medium border border-[#eadfc9]/50">
                          <CalendarDays size={13} className="text-[#c49424]" />
                          {new Date(date).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}

                      {location && (
                        <span className="flex items-center gap-1.5 rounded-lg bg-[#f8f5ef] px-3 py-1.5 font-medium border border-[#eadfc9]/50">
                          <MapPin size={13} className="text-[#c49424]" />
                          {location}
                        </span>
                      )}

                      {b.event?.booth?.boothNumber && (
                        <span className="flex items-center gap-1.5 rounded-lg bg-[#f8f5ef] px-3 py-1.5 font-medium border border-[#eadfc9]/50">
                          <Store size={13} className="text-[#c49424]" />
                          Booth #{b.event.booth.boothNumber}
                        </span>
                      )}
                    </div>

                    {/* Status Note Messages */}
                    {b.bookingStatus === "pending" && (
                      <p className="mt-4 rounded-xl bg-amber-50/80 p-3 text-xs font-medium text-amber-900 border border-amber-200">
                        {isExpoTicket
                          ? "Pass is awaiting admin approval. Once confirmed, download options will appear."
                          : "Reviewing registration. Pass key will be visible once approved."}
                      </p>
                    )}

                    {b.bookingStatus === "cancelled" && b.decisionNote && (
                      <p className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-800 border border-rose-200">
                        Reason: {b.decisionNote}
                      </p>
                    )}

                    {/* Download Button Component */}
                    {isExpoTicket && b.bookingStatus === "confirmed" && b.entryPassId && (
                      <div className="mt-4 pt-2">
                        <EntryPass booking={b} user={user} />
                      </div>
                    )}
                  </div>

                  {/* REAL TICKET STUB PERFORATION LINE & SIDE STUB */}
                  {!isExpoTicket && b.bookingStatus === "confirmed" && b.passCode && (
                    <>
                      {/* Vertical Dashed Line Divider with Notches */}
                      <div className="relative hidden md:flex items-center justify-center w-0 border-l-2 border-dashed border-[#d9c9a3] bg-[#f8f5ef]">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 h-5 w-5 rounded-full bg-[#f8f5ef] border border-[#eadfc9]" />
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-5 w-5 rounded-full bg-[#f8f5ef] border border-[#eadfc9]" />
                      </div>

                      {/* RIGHT SIDE STUB SECTION */}
                      <div className="relative flex flex-col items-center justify-center bg-[#fdf8ee] p-6 text-center md:w-56 border-t md:border-t-0 border-dashed border-[#d9c9a3]">
                        <QrCode className="h-6 w-6 text-[#c49424] mb-1" />
                        <p className="text-[9px] font-bold uppercase tracking-widest text-[#8a8379]">
                          Pass Code
                        </p>
                        <p className="mt-1 font-mono text-lg font-bold tracking-wider text-[#2f2a24]">
                          {b.passCode}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
};

export default AttendeeProfile;