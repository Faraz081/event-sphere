import React from "react";
import AdminLayout from "@/layouts/DashboardLayout/AdminLayout";
import BoothTrafficChart from "@/components/BoothTrafficChart";
import StatGrid from "@/components/ui/StatGrid";
import StatCard from "@/components/StatCard";

const dashboardStats = [
  { label: "Attendee Engagement", value: "78%" },
  { label: "Total Booth Visits", value: "1,842" },
  { label: "Most Popular Session", value: "AI in Retail" },
  { label: "Avg. Session Attendance", value: "63%" },
];

const AdminAnalytics = () => (
  <AdminLayout>
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground">
          Analytics
        </h1>
        <p className="mt-2 text-muted text-sm md:text-base">
          Review dashboard metrics, booth traffic, and platform performance from the shared layout.
        </p>
      </div>

      <StatGrid>
        {dashboardStats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} />
        ))}
      </StatGrid>

      <BoothTrafficChart />
    </div>
  </AdminLayout>
);

export default AdminAnalytics;