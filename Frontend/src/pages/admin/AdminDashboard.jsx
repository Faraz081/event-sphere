import React, { useState, useEffect, useCallback } from "react";
import StatGrid from "@/components/ui/StatGrid";
import StatCard from "@/components/StatCard";
import AdminLayout from "@/layouts/DashboardLayout/AdminLayout";
import BoothTrafficChart from "@/components/BoothTrafficChart";
import { fetchUserStats } from "@/api/userService";
import { fetchAttendeeStats } from "@/api/attendeeService";
import { RotateCcw, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAttendees: 0,
    totalOrganizers: 0,
    totalExhibitors: 0,
    pendingRegistrations: 0,
    confirmedBookings: 0,
    generatedPasses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [userRes, attendeeRes] = await Promise.all([
        fetchUserStats(),
        fetchAttendeeStats(),
      ]);

      const userStats = userRes?.stats || {};
      const attendeeStats = attendeeRes?.stats || {};

      setStats({
        totalUsers: userStats.total ?? 0,
        totalAttendees: attendeeStats.total ?? userStats.attendees ?? 0,
        totalOrganizers: userStats.organizers ?? 0,
        totalExhibitors: userStats.exhibitors ?? 0,
        pendingRegistrations: attendeeStats.pendingRegistrations ?? 0,
        confirmedBookings: attendeeStats.confirmedBookings ?? 0,
        generatedPasses: attendeeStats.generatedPasses ?? 0,
      });
    } catch (err) {
      console.error("Error loading dashboard statistics:", err);
      const msg = err.response?.data?.error || "Failed to load dashboard statistics from database.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardStats();
  }, [loadDashboardStats]);

  const cards = [
    { label: "Total Users", value: loading ? "..." : (stats.totalUsers ?? 0) },
    { label: "Total Attendees", value: loading ? "..." : (stats.totalAttendees ?? 0) },
    { label: "Total Organizers", value: loading ? "..." : (stats.totalOrganizers ?? 0) },
    { label: "Total Exhibitors", value: loading ? "..." : (stats.totalExhibitors ?? 0) },
    { label: "Pending Registrations", value: loading ? "..." : (stats.pendingRegistrations ?? 0) },
    { label: "Confirmed Bookings", value: loading ? "..." : (stats.confirmedBookings ?? 0) },
    { label: "Generated Passes", value: loading ? "..." : (stats.generatedPasses ?? 0) },
  ];

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-1">
              Admin Dashboard
            </h1>
            <p className="text-muted text-sm md:text-base">
              Manage your platform users, attendee registrations, expos, and schedules.
            </p>
          </div>
          <button
            type="button"
            onClick={loadDashboardStats}
            disabled={loading}
            className="inline-flex items-center gap-2 border border-border bg-surface text-muted hover:text-foreground px-3.5 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-background self-start sm:self-auto"
            title="Refresh statistics"
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

        <div className="mt-6">
          <BoothTrafficChart />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
