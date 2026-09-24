import React from "react";
import AttendeeLayout from "@/dashboard/layouts/AttendeeLayout";
import DashboardSectionPage from "@/dashboard/shared/DashboardSectionPage";
import { dashboardSummaries } from "@/dashboard/dashboardConfig";

const AttendeeExhibitors = () => (
  <AttendeeLayout>
    <DashboardSectionPage
      title="Exhibitors"
      description="Discover exhibitors and partners without leaving the attendee dashboard."
      stats={dashboardSummaries.attendee}
    >
      <div className="rounded-3xl border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold text-foreground">Exhibitor discovery</h2>
        <p className="mt-2 text-sm text-muted">
          This section can later connect to search and filtering, but the role-based routing is already in place.
        </p>
      </div>
    </DashboardSectionPage>
  </AttendeeLayout>
);

export default AttendeeExhibitors;
