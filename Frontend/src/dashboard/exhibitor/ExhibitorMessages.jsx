import React from "react";
import ExhibitorLayout from "@/dashboard/layouts/ExhibitorLayout";
import DashboardSectionPage from "@/dashboard/shared/DashboardSectionPage";
import { dashboardSummaries } from "@/dashboard/dashboardConfig";

const ExhibitorMessages = () => (
  <ExhibitorLayout>
    <DashboardSectionPage
      title="Messages"
      description="Keep track of conversations, leads, and meeting requests inside the same dashboard chrome."
      stats={dashboardSummaries.exhibitor}
    >
      <div className="rounded-3xl border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold text-foreground">Inbox</h2>
        <p className="mt-2 text-sm text-muted">
          Message data can be wired in later. Right now this page proves the exhibitor route is protected and shared.
        </p>
      </div>
    </DashboardSectionPage>
  </ExhibitorLayout>
);

export default ExhibitorMessages;
