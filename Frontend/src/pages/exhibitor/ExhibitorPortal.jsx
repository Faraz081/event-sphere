import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Store, ClipboardList, User, CalendarDays, CalendarCheck } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Legend } from "recharts";
import StatGrid from "@/components/shared/StatGrid";
import DashboardLayout from "@/layouts/DashboardLayout";
import StatCard from "@/components/shared/StatCard";
import { fetchMyBooth } from "@/store/slices/boothSlice";
import { fetchMyEvents, fetchBookingRequests } from "@/store/slices/eventSlice";
import { fetchContacts, fetchUnreadCounts } from "@/store/slices/messageSlice";

const POLL_MS = 30000; 
const groupOf = (status) =>
  status === "confirmed" || status === "approved"
    ? "approved" : status === "cancelled" || status === "rejected"
    ? "rejected" : "pending";

const tooltipStyle = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "8px",
};

const ExhibitorPortal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myBooths = [] } = useSelector((state) => state.booth);
  const { events = [], requests = [] } = useSelector((state) => state.event);
  const { contacts, unread } = useSelector((state) => state.message);
  const [lastUpdated, setLastUpdated] = useState(null);

  const refresh = useCallback(async () => {
    await Promise.all([
      dispatch(fetchMyBooth()),
      dispatch(fetchMyEvents()),
      dispatch(fetchBookingRequests()),
      dispatch(fetchContacts()),
      dispatch(fetchUnreadCounts()),
    ]);
    setLastUpdated(new Date());
  }, [dispatch]);

  useEffect(() => {
    refresh();
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [refresh]);

  const totalUnread = unread.reduce((sum, u) => sum + u.count, 0);

  const unreadContacts = unread
    .map((u) => ({ ...u, contact: contacts.find((c) => c._id === u._id) }))
    .filter((u) => u.contact);
  const analytics = useMemo(() => {
    const approvedBooths = myBooths.filter((b) => b.status !== "pending");
    const products = approvedBooths.reduce((sum, b) => sum + (b.products?.length ?? 0), 0);

    const eventsApproved = events.filter((e) => e.status === "approved").length;

    const counts = { pending: 0, approved: 0, rejected: 0 };
    requests.forEach((r) => {
      counts[groupOf(r.bookingStatus)] += 1;
    });

    const perEvent = {};
    requests.forEach((r) => {
      const name = r.event?.title || r.eventName || "Event";
      if (!perEvent[name]) perEvent[name] = { name, pending: 0, approved: 0, rejected: 0 };
      perEvent[name][groupOf(r.bookingStatus)] += 1;
    });

    const statusData = [
      { name: "Pending", value: counts.pending },
      { name: "Approved", value: counts.approved },
      { name: "Rejected", value: counts.rejected },
    ];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcomingBookings = requests.filter(
      (r) => groupOf(r.bookingStatus) === "approved" && r.eventDate && new Date(r.eventDate) >= today
    ).length;

    const stallCapacity = events
      .filter((e) => e.status === "approved")
      .reduce((sum, e) => sum + (e.boothCapacity ?? 0), 0);

    const pendingRequests = requests
      .filter((r) => groupOf(r.bookingStatus) === "pending")
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);

    return {
      products,
      upcomingBookings,
      stallCapacity,
      eventsApproved,
      counts,
      statusData,
      perEventData: Object.values(perEvent),
      pendingRequests,
    };
  }, [myBooths, events, requests]);

  const stats = [
    { label: "My Booths", value: myBooths.length ? myBooths.length : "Not reserved" },
    { label: "Booth Products", value: analytics.products },
    { label: "Events (Approved)", value: `${analytics.eventsApproved} / ${events.length}` },
    { label: "Pending Bookings", value: analytics.counts.pending },
    { label: "Approved Bookings", value: analytics.counts.approved },
    { label: "Upcoming Bookings", value: analytics.upcomingBookings },
    { label: "Stall Capacity", value: analytics.stallCapacity },
    { label: "Unread Messages", value: totalUnread },
  ];

  const quickActions = [
    { label: "Manage Registration", icon: ClipboardList, path: "/exhibitor/registration" },
    { label: "View My Booth", icon: Store, path: "/exhibitor/booth" },
    { label: "My Events", icon: CalendarDays, path: "/exhibitor/events" },
    { label: "Booking Requests", icon: CalendarCheck, path: "/exhibitor/bookings" },
    { label: "Open Messages", icon: MessageSquare, path: "/exhibitor/messages" },
    { label: "Edit Profile", icon: User, path: "/exhibitor/profile" },
  ];

  const hasActivity = analytics.pendingRequests.length > 0 || unreadContacts.length > 0;

  return (
    <DashboardLayout role="exhibitor">
      <div className="p-4 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="mb-2 font-display text-2xl md:text-4xl font-bold text-foreground">Exhibitor Dashboard</h1>
            <p className="mb-6 text-muted text-sm md:text-base">
              Manage your booth, events, bookings, and communications from one place.
            </p>
          </div>
        </div>

        <StatGrid>
          {stats.map((stat) => (
            <StatCard key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </StatGrid>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Booking Requests by Status</h2>
            {requests.length === 0 ? (
              <p className="text-sm text-muted">No booking requests yet.</p>
            ) : (
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.statusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="name" stroke="var(--color-muted)" fontSize={12} />
                    <YAxis stroke="var(--color-muted)" fontSize={12} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="value" name="Requests" fill="var(--color-gold)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Requests per Event</h2>
            {analytics.perEventData.length === 0 ? (
              <p className="text-sm text-muted">Requests for your events will show up here.</p>
            ) : (
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.perEventData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="name" stroke="var(--color-muted)" fontSize={12} />
                    <YAxis stroke="var(--color-muted)" fontSize={12} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Bar dataKey="pending" name="Pending" stackId="a" fill="var(--color-gold)" />
                    <Bar dataKey="approved" name="Approved" stackId="a" fill="var(--color-emerald)" />
                    <Bar dataKey="rejected" name="Rejected" stackId="a" fill="#ef4444" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
            {!hasActivity && <p className="text-sm text-muted">Nothing needs your attention right now.</p>}

            <div className="space-y-3">
              {analytics.pendingRequests.map((r) => (
                <button key={r._id} onClick={() => navigate("/exhibitor/bookings")} className="w-full flex items-center justify-between rounded-xl border border-border bg-background p-3 text-left hover:border-gold/40">
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.user?.name || "Attendee"}</p>
                    <p className="text-xs text-muted">
                      Booking request for {r.event?.title || r.eventName || "your event"}
                    </p>
                  </div>
                  <span className="rounded-full border border-gold/40 bg-gold/20 px-2 py-0.5 text-xs text-gold">Pending</span>
                </button>
              ))}

              {unreadContacts.map((u) => (
                <button key={u._id} onClick={() => navigate("/exhibitor/messages")} className="w-full flex items-center justify-between rounded-xl border border-border bg-background p-3 text-left hover:border-gold/40">
                  <div>
                    <p className="text-sm font-medium text-foreground">{u.contact.name}</p>
                    <p className="text-xs text-muted">{u.contact.role} sent you a message</p>
                  </div>
                  <span className="rounded-full bg-gold text-background text-xs font-semibold w-5 h-5 flex items-center justify-center">{u.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map(({ label, icon: Icon, path }) => (
                <button key={path} onClick={() => navigate(path)} className="flex flex-col items-start gap-2 rounded-xl border border-border bg-background p-4 text-left hover:border-gold/40">
                  <Icon size={18} className="text-gold" />
                  <span className="text-sm font-medium text-foreground">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ExhibitorPortal;