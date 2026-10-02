import React from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import DashboardSectionPage from "@/components/shared/DashboardSectionPage";
import { dashboardSummaries } from "@/layouts/dashboardConfig";

const ExhibitorRegistration = () => (
  <DashboardLayout role="exhibitor">
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
  </DashboardLayout>
);

export default ExhibitorRegistration;
