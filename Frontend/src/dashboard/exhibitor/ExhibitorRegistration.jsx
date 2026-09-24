import React from "react";
import ExhibitorLayout from "@/dashboard/layouts/ExhibitorLayout";
import DashboardSectionPage from "@/dashboard/shared/DashboardSectionPage";
import { dashboardSummaries } from "@/dashboard/dashboardConfig";

const ExhibitorRegistration = () => (
  <ExhibitorLayout>
    <DashboardSectionPage
      title="Registration"
      description="Review exhibitor registration details and approval workflow from the shared shell."
      stats={dashboardSummaries.exhibitor}
    >
      <div className="rounded-3xl border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold text-foreground">Approval status</h2>
        <p className="mt-2 text-sm text-muted">
          Registration forms and approval steps can be connected to the backend later without remounting the layout.
        </p>
      </div>
    </DashboardSectionPage>
  </ExhibitorLayout>
);

export default ExhibitorRegistration;
