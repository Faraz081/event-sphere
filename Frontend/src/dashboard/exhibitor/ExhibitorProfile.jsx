import React from "react";
import ExhibitorLayout from "@/dashboard/layouts/ExhibitorLayout";
import DashboardSectionPage from "@/dashboard/shared/DashboardSectionPage";
import { dashboardSummaries } from "@/dashboard/dashboardConfig";

const ExhibitorProfile = () => (
  <ExhibitorLayout>
    <DashboardSectionPage
      title="Profile"
      description="Edit company and contact details from the shared exhibitor area."
      stats={dashboardSummaries.exhibitor}
    >
      <div className="rounded-3xl border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold text-foreground">Company profile</h2>
        <p className="mt-2 text-sm text-muted">
          Profile management can be connected to backend APIs later without any layout changes.
        </p>
      </div>
    </DashboardSectionPage>
  </ExhibitorLayout>
);

export default ExhibitorProfile;
