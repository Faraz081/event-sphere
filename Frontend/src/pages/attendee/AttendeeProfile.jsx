import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";
import { Building2, CalendarDays, Mail, Phone, UserRound, Ticket, MapPin, Store, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { fetchMyRegistrations } from "@/api/attendeePortalService";

const ProfileDetail = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 border-b border-[#f0e8d8] py-3.5 last:border-0">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#c49424]/10 text-[#a8790d]">
      <Icon size={16} />
    </span>
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9a9084]">{label}</p>
      <p className="break-words text-sm font-medium text-[#2f2a24]">{value || "Not provided"}</p>
    </div>
  </div>
);

const bookingBadge = {
  pending: { label: "Waiting for exhibitor approval", className: "bg-yellow-100 text-yellow-800", bar: "bg-yellow-400", icon: Clock3 },
  confirmed: { label: "Confirmed", className: "bg-green-100 text-green-800", bar: "bg-green-500", icon: CheckCircle2 },
  cancelled: { label: "Not approved", className: "bg-red-100 text-red-700", bar: "bg-red-400", icon: XCircle },
};

const StatPill = ({ label, value, className }) => (
  <div className="rounded-2xl border border-[#eadfc9] bg-white px-4 py-3 shadow-sm">
    <p className={`font-serif text-2xl font-bold ${className}`}>{value}</p>
    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9a9084]">{label}</p>
  </div>
);

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
      <div className="mx-auto max-w-6xl">
        {/* ================= HEADER ================= */}
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-[#eadfc9] bg-gradient-to-r from-[#f2e7d3] via-[#fff8ea] to-[#f8f5ef] px-6 py-8 sm:px-10 sm:py-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#c49424]/15 blur-3xl" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#a8790d]">Your EventSphere account</p>
            <h1 className="mt-3 font-serif text-4xl font-bold text-[#2f2a24] sm:text-5xl">Attendee Profile</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#5d574f]">Your account details and ticket bookings in one place.</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          {/* ================= PROFILE CARD ================= */}
          <aside className="h-fit overflow-hidden rounded-3xl border border-[#eadfc9] bg-[#fffdf9] shadow-[0_24px_70px_-36px_rgba(89,65,25,0.35)] lg:sticky lg:top-28">
            <div className="h-20 bg-gradient-to-r from-[#e3b94a] via-[#c49424] to-[#a8790d]" />
            <div className="px-6 pb-6">
              <div className="-mt-12 flex flex-col items-center text-center">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg" />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-[#2f2a24] font-serif text-3xl font-bold text-[#e3b94a] shadow-lg">
                    {initials}
                  </div>
                )}
                <h2 className="mt-4 break-words font-serif text-2xl font-semibold text-[#2f2a24]">{user.name}</h2>
                <p className="mt-1 break-words text-sm text-[#5d574f]">{user.email}</p>
                <span className="mt-3 rounded-full bg-[#c49424]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a8790d]">
                  {user.role}
                </span>
              </div>

              <div className="mt-6">
                <ProfileDetail icon={UserRound} label="Full name" value={user.name} />
                <ProfileDetail icon={Mail} label="Email" value={user.email} />
                <ProfileDetail icon={Phone} label="Phone" value={user.phone} />
                <ProfileDetail icon={Building2} label="Company / organization" value={user.companyName} />
                <ProfileDetail icon={CalendarDays} label="Member since" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : null} />
              </div>
            </div>
          </aside>

          {/* ================= MY BOOKINGS ================= */}
          <section>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#eadfc9] bg-[#fffdf9] p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2f2a24] text-[#e3b94a]">
                  <Ticket size={20} />
                </span>
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#2f2a24]">My Bookings</h2>
                  <p className="text-xs text-[#8a8379]">Track your tickets and pass codes</p>
                </div>
              </div>
              <div className="flex gap-3">
                <StatPill label="Total" value={bookings.length} className="text-[#2f2a24]" />
                <StatPill label="Confirmed" value={bookings.filter((b) => b.bookingStatus === "confirmed").length} className="text-green-700" />
                <StatPill label="Pending" value={bookings.filter((b) => b.bookingStatus === "pending").length} className="text-yellow-700" />
              </div>
            </div>

            {loadingBookings && <p className="text-sm text-[#5d574f]">Loading your bookings...</p>}

            {!loadingBookings && bookings.length === 0 && (
              <div className="flex flex-col items-center rounded-3xl border border-dashed border-[#d9c9a3] bg-white/60 px-6 py-14 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#c49424]/10 text-[#a8790d]">
                  <Ticket size={24} />
                </span>
                <p className="mt-4 font-serif text-lg font-semibold text-[#2f2a24]">No bookings yet</p>
                <p className="mt-1 text-[#5d574f]">You have not booked any tickets yet.</p>
              </div>
            )}

            <div className="space-y-5">
              {bookings.map((b) => {
                const badge = bookingBadge[b.bookingStatus] ?? bookingBadge.pending;
                const BadgeIcon = badge.icon;
                const title = b.event?.title ?? b.eventName ?? b.expo?.title ?? "Event";
                const date = b.event?.date ?? b.expo?.date;
                const expoTitle = b.event?.expo?.title ?? b.expo?.title;

                return (
                  <div key={b._id} className="relative flex flex-col overflow-hidden rounded-3xl border border-[#eadfc9] bg-white shadow-sm transition hover:shadow-md sm:flex-row">
                    <div className={`h-1.5 w-full shrink-0 sm:h-auto sm:w-1.5 ${badge.bar}`} />

                    <div className="min-w-0 flex-1 p-5 sm:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-serif text-xl font-bold text-[#2f2a24]">{title}</h3>
                          {expoTitle && <p className="mt-1 text-sm text-[#5d574f]">{expoTitle}</p>}
                        </div>
                        <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}>
                          <BadgeIcon size={13} />
                          {badge.label}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 text-sm text-[#5d574f]">
                        {date && (
                          <span className="flex items-center gap-2 rounded-full bg-[#f8f5ef] px-3 py-1.5">
                            <CalendarDays size={14} className="text-[#c49424]" />
                            {new Date(date).toLocaleString()}
                          </span>
                        )}
                        {b.event?.expo?.location && (
                          <span className="flex items-center gap-2 rounded-full bg-[#f8f5ef] px-3 py-1.5">
                            <MapPin size={14} className="text-[#c49424]" />
                            {b.event.expo.location}
                          </span>
                        )}
                        {b.event?.booth?.boothNumber && (
                          <span className="flex items-center gap-2 rounded-full bg-[#f8f5ef] px-3 py-1.5">
                            <Store size={14} className="text-[#c49424]" />
                            Booth {b.event.booth.boothNumber}
                          </span>
                        )}
                      </div>

                      {b.bookingStatus === "pending" && (
                        <p className="mt-4 rounded-xl bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                          The exhibitor is reviewing your request. Your pass code will appear here once it is approved.
                        </p>
                      )}

                      {b.bookingStatus === "cancelled" && b.decisionNote && (
                        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">Reason: {b.decisionNote}</p>
                      )}
                    </div>

                    {b.bookingStatus === "confirmed" && b.passCode && (
                      <div className="relative flex shrink-0 flex-col items-center justify-center border-t-2 border-dashed border-[#e3d3ad] bg-gradient-to-b from-[#fffaf0] to-[#fdf3d9] px-8 py-6 text-center sm:w-52 sm:border-l-2 sm:border-t-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8a8379]">Your pass code</p>
                        <p className="mt-2 break-all font-mono text-2xl font-bold tracking-widest text-[#a8790d]">{b.passCode}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default AttendeeProfile;