import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Building2, CalendarDays, Mail, Phone, UserRound, Ticket, MapPin, Store } from "lucide-react";
import { fetchMyRegistrations } from "@/api/attendeePortalService";

const ProfileDetail = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-4 rounded-2xl border border-[#eadfc9] bg-white/70 p-4">
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#c49424]/10 text-[#a8790d]">
      <Icon size={18} />
    </span>
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#82786b]">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-[#2f2a24]">
        {value || "Not provided"}
      </p>
    </div>
  </div>
);

const bookingBadge = {
  pending: { label: "Waiting for exhibitor approval", className: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Confirmed", className: "bg-green-100 text-green-800" },
  cancelled: { label: "Not approved", className: "bg-red-100 text-red-700" },
};

const AttendeeProfile = () => {
  const user = useSelector((state) => state.auth.user);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const initials = user.name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMyRegistrations();
        setBookings(data.registrations ?? []);
      } catch (err) {
        toast.error(err.response?.data?.error || "Could not load your bookings");
      } finally {
        setLoadingBookings(false);
      }
    };
    load();
  }, []);

  return (
    <main className="min-h-[70vh] bg-[#f8f5ef] px-5 pb-20 pt-32 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#a8790d]">
            Your EventSphere account
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-[#2f2a24] sm:text-5xl">
            Attendee Profile
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#5d574f]">
            Your account details and ticket bookings in one place.
          </p>
        </div>

        <section className="overflow-hidden rounded-[2rem] border border-[#eadfc9] bg-[#fffdf9] shadow-[0_24px_70px_-36px_rgba(89,65,25,0.3)]">
          <div className="bg-gradient-to-r from-[#f2e7d3] via-[#fff8ea] to-[#f8f5ef] px-6 py-8 sm:px-9 sm:py-10">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-20 w-20 rounded-2xl border-4 border-white object-cover shadow-md"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-[#c49424] font-serif text-2xl font-bold text-white shadow-md">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a8790d]">
                  {user.role}
                </p>
                <h2 className="mt-1 break-words font-serif text-3xl font-semibold text-[#2f2a24]">
                  {user.name}
                </h2>
                <p className="mt-1 break-words text-sm text-[#5d574f]">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-8">
            <ProfileDetail icon={UserRound} label="Full name" value={user.name} />
            <ProfileDetail icon={Mail} label="Email" value={user.email} />
            <ProfileDetail icon={Phone} label="Phone" value={user.phone} />
            <ProfileDetail
              icon={Building2}
              label="Company / organization"
              value={user.companyName}
            />
            <ProfileDetail
              icon={CalendarDays}
              label="Member since"
              value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : null}
            />
          </div>
        </section>

        {/* ================= MY BOOKINGS ================= */}
        <section className="mt-10">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c49424]/10 text-[#a8790d]">
              <Ticket size={18} />
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#2f2a24]">My Bookings</h2>
          </div>

          {loadingBookings && <p className="text-sm text-[#5d574f]">Loading your bookings...</p>}

          {!loadingBookings && bookings.length === 0 && (
            <div className="rounded-2xl border border-[#eadfc9] bg-white p-6 text-center">
              <p className="text-[#5d574f]">You have not booked any tickets yet.</p>
            </div>
          )}

          <div className="space-y-4">
            {bookings.map((b) => {
              const badge = bookingBadge[b.bookingStatus] ?? bookingBadge.pending;
              const title = b.event?.title ?? b.eventName ?? b.expo?.title ?? "Event";
              const date = b.event?.date ?? b.expo?.date;
              const expoTitle = b.event?.expo?.title ?? b.expo?.title;

              return (
                <div key={b._id} className="rounded-2xl border border-[#eadfc9] bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-serif text-xl font-bold text-[#2f2a24]">{title}</h3>
                      {expoTitle && <p className="mt-1 text-sm text-[#5d574f]">{expoTitle}</p>}
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#5d574f]">
                    {date && (
                      <span className="flex items-center gap-2">
                        <CalendarDays size={14} className="text-[#c49424]" />
                        {new Date(date).toLocaleString()}
                      </span>
                    )}
                    {b.event?.expo?.location && (
                      <span className="flex items-center gap-2">
                        <MapPin size={14} className="text-[#c49424]" />
                        {b.event.expo.location}
                      </span>
                    )}
                    {b.event?.booth?.boothNumber && (
                      <span className="flex items-center gap-2">
                        <Store size={14} className="text-[#c49424]" />
                        Booth {b.event.booth.boothNumber}
                      </span>
                    )}
                  </div>

                  {b.bookingStatus === "confirmed" && b.passCode && (
                    <div className="mt-4 rounded-xl border border-dashed border-[#c49424] bg-[#fffdf9] p-4 text-center">
                      <p className="text-xs uppercase tracking-widest text-[#8a8379]">Your pass code</p>
                      <p className="mt-1 font-mono text-2xl font-bold tracking-widest text-[#c49424]">{b.passCode}</p>
                    </div>
                  )}

                  {b.bookingStatus === "pending" && (
                    <p className="mt-4 text-sm text-[#8a8379]">
                      The exhibitor is reviewing your request. Your pass code will appear here once it is approved.
                    </p>
                  )}

                  {b.bookingStatus === "cancelled" && b.decisionNote && (
                    <p className="mt-4 text-sm text-red-700">Reason: {b.decisionNote}</p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
};

export default AttendeeProfile;