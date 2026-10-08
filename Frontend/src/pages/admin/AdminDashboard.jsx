import React, { useState, useEffect, useCallback } from "react";
import StatGrid from "@/components/shared/StatGrid";
import StatCard from "@/components/shared/StatCard";
import DashboardLayout from "@/layouts/DashboardLayout";
import { fetchUserStats } from "@/api/userService";
import { fetchAttendeeStats } from "@/api/attendeeService";
import { fetchAnalytics } from "@/api/analyticsService";
import { RotateCcw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const BOOTH_COLORS = {
  Available: "#C9A227",
  Reserved: "#34d399",
  Occupied: "#94a3b8",
};

const EXHIBITOR_COLORS = ["#C9A227", "#34d399", "#f87171"];

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAttendees: 0,
    totalExhibitors: 0,
    pendingExhibitors: 0,
    totalExpos: 0,
    publishedExpos: 0,
    totalBooths: 0,
    occupancyRate: 0,
    pendingRegistrations: 0,
    confirmedBookings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  const loadDashboardStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [userRes, attendeeRes, analyticsRes] = await Promise.all([
        fetchUserStats(),
        fetchAttendeeStats(),
        fetchAnalytics(),
      ]);

      const userStats = userRes?.stats || {};
      const attendeeStats = attendeeRes?.stats || {};
      const overview = analyticsRes?.analytics?.overview || {};
      const exhibitors = analyticsRes?.analytics?.exhibitors || {};
      setAnalytics(analyticsRes?.analytics || null);

      setStats({
        totalUsers: userStats.total ?? overview.totalUsers ?? 0,
        totalAttendees: attendeeStats.total ?? overview.totalAttendees ?? 0,
        totalExhibitors: exhibitors.total ?? userStats.exhibitors ?? 0,
        pendingExhibitors: exhibitors.pending ?? 0,
        totalExpos: overview.totalExpos ?? 0,
        publishedExpos: overview.publishedExpos ?? 0,
        totalBooths: overview.totalBooths ?? 0,
        occupancyRate: overview.occupancyRate ?? 0,
        pendingRegistrations: attendeeStats.pendingRegistrations ?? 0,
        confirmedBookings: attendeeStats.confirmedBookings ?? 0,
      });
    } catch (err) {
      console.error("Error loading dashboard statistics:", err);
      const msg =
        err.response?.data?.error ||
        "Failed to load dashboard statistics from database.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardStats();
  }, [loadDashboardStats]);

  const v = (n) => (loading ? "..." : n ?? 0);
  const overview = analytics?.overview || {};
  const booths = analytics?.booths || {};

  const cards = [
    { label: "Total Expos", value: v(stats.totalExpos) },
    { label: "Published Expos", value: v(stats.publishedExpos) },
    { label: "Total Booths", value: v(stats.totalBooths) },
    { label: "Booth Occupancy", value: loading ? "..." : `${stats.occupancyRate}%` },
    { label: "Total Exhibitors", value: v(stats.totalExhibitors) },
    { label: "Pending Exhibitors", value: v(stats.pendingExhibitors) },
    { label: "Total Attendees", value: v(stats.totalAttendees) },
    { label: "Total Users", value: v(stats.totalUsers) },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="p-4 md:p-8 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-1">
              Admin Dashboard
            </h1>
            <p className="text-muted text-sm md:text-base">
              Overview of expos, booths, exhibitors and attendees.
            </p>
          </div>
          <button
            type="button"
            onClick={loadDashboardStats}
            disabled={loading}
            className="inline-flex items-center gap-2 border border-border bg-surface text-muted hover:text-foreground px-3.5 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-background self-start sm:self-auto"
          >
            <RotateCcw size={16} className={loading ? "animate-spin text-gold" : ""} />
            <span>{loading ? "Refreshing..." : "Refresh Stats"}</span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={loadDashboardStats}
              className="underline font-medium hover:text-white"
            >
              Try again
            </button>
          </div>
        )}

        <StatGrid>
          {cards.map((stat) => (
            <StatCard key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </StatGrid>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            to="/admin/exhibitors"
            className="rounded-xl border border-border bg-surface p-4 hover:border-gold/40 transition-colors"
          >
            <p className="text-sm text-muted">Pending approvals</p>
            <p className="text-2xl font-semibold text-gold mt-1">
              {loading ? "..." : stats.pendingExhibitors}
            </p>
            <p className="text-xs text-muted mt-1">Review exhibitors →</p>
          </Link>
          <Link
            to="/admin/booths"
            className="rounded-xl border border-border bg-surface p-4 hover:border-gold/40 transition-colors"
          >
            <p className="text-sm text-muted">Booth occupancy</p>
            <p className="text-2xl font-semibold text-foreground mt-1">
              {loading ? "..." : `${stats.occupancyRate}%`}
            </p>
            <p className="text-xs text-muted mt-1">Manage booths →</p>
          </Link>
          <Link
            to="/admin/expos"
            className="rounded-xl border border-border bg-surface p-4 hover:border-gold/40 transition-colors"
          >
            <p className="text-sm text-muted">Expos</p>
            <p className="text-2xl font-semibold text-foreground mt-1">
              {loading ? "..." : stats.totalExpos}
            </p>
            <p className="text-xs text-muted mt-1">Manage expos →</p>
          </Link>
          <Link
            to="/admin#dashboard-analytics"
            className="rounded-xl border border-border bg-surface p-4 hover:border-gold/40 transition-colors"
          >
            <p className="text-sm text-muted">Analytics charts</p>
            <p className="text-2xl font-semibold text-foreground mt-1">View</p>
            <p className="text-xs text-muted mt-1">Charts & reports →</p>
          </Link>
        </div>

        <div id="dashboard-analytics" className="grid grid-cols-1 lg:grid-cols-2 gap-6 scroll-mt-6">
          <div className="bg-surface border border-border rounded-2xl p-5">
            <h2 className="font-display text-foreground text-lg mb-4">Booth Status Breakdown</h2>
            {(analytics?.boothStatusBreakdown?.length ?? 0) === 0 || overview.totalBooths === 0 ? (
              <p className="text-muted text-sm py-10 text-center">
                {loading ? "Loading analytics..." : "No booth data yet"}
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={analytics.boothStatusBreakdown}>
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke="var(--color-muted)" />
                  <YAxis stroke="var(--color-muted)" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-foreground)",
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {analytics.boothStatusBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={BOOTH_COLORS[entry.name] || "#C9A227"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-surface border border-border rounded-2xl p-5">
            <h2 className="font-display text-foreground text-lg mb-4">Exhibitor Status</h2>
            {(analytics?.exhibitorStatusBreakdown?.every((entry) => entry.value === 0) ?? true) ? (
              <p className="text-muted text-sm py-10 text-center">
                {loading ? "Loading analytics..." : "No exhibitor data yet"}
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={analytics.exhibitorStatusBreakdown.filter((entry) => entry.value > 0)}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {analytics.exhibitorStatusBreakdown
                      .filter((entry) => entry.value > 0)
                      .map((entry, index) => (
                        <Cell key={entry.name} fill={EXHIBITOR_COLORS[index % EXHIBITOR_COLORS.length]} />
                      ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-foreground)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5">
          <h2 className="font-display text-foreground text-lg mb-4">Recent Expos</h2>
          {!analytics?.recentExpos?.length ? (
            <p className="text-muted text-sm">
              {loading ? "Loading analytics..." : "No expos created yet."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted">
                    <th className="text-left py-2 pr-4 font-medium">Title</th>
                    <th className="text-left py-2 pr-4 font-medium">Date</th>
                    <th className="text-left py-2 pr-4 font-medium">Location</th>
                    <th className="text-left py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentExpos.map((expo) => (
                    <tr key={expo._id} className="border-b border-border last:border-0">
                      <td className="py-3 pr-4 text-foreground font-medium">{expo.title}</td>
                      <td className="py-3 pr-4 text-muted">
                        {expo.date
                          ? new Date(expo.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="py-3 pr-4 text-muted">{expo.location || "—"}</td>
                      <td className="py-3 text-muted capitalize">{expo.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="text-sm text-muted">
          Occupancy: <span className="text-gold font-medium">{booths.occupancyRate ?? 0}%</span>
          {" · "}Assigned booths: {booths.assigned ?? 0} / {overview.totalBooths ?? 0}
          {" · "}Sessions in schedule: {overview.totalSessions ?? 0}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
