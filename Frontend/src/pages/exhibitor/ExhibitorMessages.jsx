import React from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import DashboardSectionPage from "@/components/shared/DashboardSectionPage";
import MessagesPanel from "@/components/shared/MessagesPanel";

const ExhibitorMessages = () => (
  <DashboardLayout role="exhibitor">
    <DashboardSectionPage
      title="Messages"
      description="Chat with the admin and other exhibitors."
    >
      <MessagesPanel />
    </DashboardSectionPage>
  </DashboardLayout>
);

export default ExhibitorMessages;