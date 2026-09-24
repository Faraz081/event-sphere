import React from "react";
import AttendeeLayout from "@/dashboard/layouts/AttendeeLayout";
import DashboardSectionPage from "@/dashboard/shared/DashboardSectionPage";
import { dashboardSummaries } from "@/dashboard/dashboardConfig";

const AttendeeProfile = () => (
  <AttendeeLayout>
    <DashboardSectionPage
      title="Profile"
      description="Update attendee preferences, contact details, and saved interests."
      stats={dashboardSummaries.attendee}
    >
      <div className="rounded-3xl border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold text-foreground">Profile settings</h2>
        <p className="mt-2 text-sm text-muted">
          Profile editing can be wired in later without changing the shared dashboard structure.
        </p>
      </div>
    </DashboardSectionPage>
  </AttendeeLayout>
);

export default AttendeeProfile;
