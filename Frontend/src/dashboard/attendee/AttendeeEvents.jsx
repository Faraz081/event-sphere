import React from "react";
import AttendeeLayout from "@/dashboard/layouts/AttendeeLayout";
import DashboardSectionPage from "@/dashboard/shared/DashboardSectionPage";
import { dashboardSummaries } from "@/dashboard/dashboardConfig";

const AttendeeEvents = () => (
  <AttendeeLayout>
    <DashboardSectionPage
      title="Events"
      description="Browse upcoming events, track sessions, and plan your schedule from the shared dashboard layout."
      stats={dashboardSummaries.attendee}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-foreground">Upcoming events</h2>
          <p className="mt-2 text-sm text-muted">
            Your registered events and bookmarked sessions will appear here once the backend is connected.
          </p>
        </div>
        <div className="rounded-3xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-foreground">Suggested sessions</h2>
          <p className="mt-2 text-sm text-muted">
            Recommendations can be wired to real attendee preferences without changing the dashboard shell.
          </p>
        </div>
      </div>
    </DashboardSectionPage>
  </AttendeeLayout>
);

export default AttendeeEvents;
