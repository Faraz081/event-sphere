import React from "react";
import ExhibitorLayout from "@/dashboard/layouts/ExhibitorLayout";
import DashboardSectionPage from "@/dashboard/shared/DashboardSectionPage";
import { dashboardSummaries } from "@/dashboard/dashboardConfig";

const ExhibitorBooth = () => (
  <ExhibitorLayout>
    <DashboardSectionPage
      title="My Booth"
      description="Manage booth details, assets, and visibility from a role-aware dashboard page."
      stats={dashboardSummaries.exhibitor}
    >
      <div className="rounded-3xl border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold text-foreground">Booth overview</h2>
        <p className="mt-2 text-sm text-muted">
          Booth management content can be expanded with real data later, while the shared shell remains unchanged.
        </p>
      </div>
    </DashboardSectionPage>
  </ExhibitorLayout>
);

export default ExhibitorBooth;
