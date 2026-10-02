import React, { useState, useEffect } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import StatGrid from "@/components/shared/StatGrid";
import StatCard from "@/components/shared/StatCard";
import { fetchAnalytics } from "@/api/analyticsService";
import { toast } from "sonner";
import { RotateCcw, AlertCircle } from "lucide-react";
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

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAnalytics();
      setAnalytics(data.analytics);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to load analytics");
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const overview = analytics?.overview || {};
  const booths = analytics?.booths || {};
  const exhibitors = analytics?.exhibitors || {};

  const overviewStats = [
    { label: "Total Expos", value: overview.totalExpos ?? "—" },
    { label: "Published Expos", value: overview.publishedExpos ?? "—" },
    { label: "Total Booths", value: overview.totalBooths ?? "—" },
    { label: "Booth Occupancy", value: overview.occupancyRate != null ? `${overview.occupancyRate}%` : "—" },
    { label: "Total Exhibitors", value: overview.totalExhibitors ?? "—" },
    { label: "Approved Exhibitors", value: exhibitors.approved ?? "—" },
    { label: "Pending Approvals", value: exhibitors.pending ?? "—" },
    { label: "Total Attendees", value: overview.totalAttendees ?? "—" },
  ];

  return (
    <DashboardLayout role="admin">
      <div className="p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground">
              Analytics
            </h1>
            <p className="mt-2 text-muted text-sm md:text-base">
              Real-time overview of expos, booths, exhibitors and attendees.
            </p>
          </div>

          <button
            onClick={loadAnalytics}
            disabled={loading}
            className="inline-flex items-center gap-2 border border-border bg-surface text-muted hover:text-foreground px-3.5 py-2 rounded-xl text-sm font-medium transition-colors self-start"
          >
            <RotateCcw size={16} className={loading ? "animate-spin text-gold" : ""} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {loading && !analytics ? (
          <div className="py-20 text-center text-muted">Loading analytics...</div>
        ) : (
          <>
            {/* Stats Cards */}
            <StatGrid>
              {overviewStats.map((stat) => (
                <StatCard key={stat.label} label={stat.label} value={stat.value} />
              ))}
            </StatGrid>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Booth Status Bar Chart */}
              <div className="bg-surface border border-border rounded-2xl p-5">
                <h3 className="font-display text-foreground text-lg mb-4">
                  Booth Status Breakdown
                </h3>
                {(analytics?.boothStatusBreakdown?.length ?? 0) === 0 ||
                overview.totalBooths === 0 ? (
                  <p className="text-muted text-sm py-10 text-center">No booth data yet</p>
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
                          <Cell
                            key={entry.name}
                            fill={BOOTH_COLORS[entry.name] || "#C9A227"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Exhibitor Status Pie */}
              <div className="bg-surface border border-border rounded-2xl p-5">
                <h3 className="font-display text-foreground text-lg mb-4">
                  Exhibitor Status
                </h3>
                {(analytics?.exhibitorStatusBreakdown?.every((e) => e.value === 0) ?? true) ? (
                  <p className="text-muted text-sm py-10 text-center">No exhibitor data yet</p>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={analytics.exhibitorStatusBreakdown.filter((e) => e.value > 0)}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {analytics.exhibitorStatusBreakdown
                          .filter((e) => e.value > 0)
                          .map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={EXHIBITOR_COLORS[index % EXHIBITOR_COLORS.length]}
                            />
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

            {/* Recent Expos */}
            <div className="bg-surface border border-border rounded-2xl p-5">
              <h3 className="font-display text-foreground text-lg mb-4">
                Recent Expos
              </h3>
              {!analytics?.recentExpos?.length ? (
                <p className="text-muted text-sm">No expos created yet.</p>
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

            {/* Quick summary line */}
            <div className="text-sm text-muted">
              Occupancy: <span className="text-gold font-medium">{booths.occupancyRate ?? 0}%</span>
              {" · "}
              Assigned booths: {booths.assigned ?? 0} / {overview.totalBooths ?? 0}
              {" · "}
              Sessions in schedule: {overview.totalSessions ?? 0}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalytics;