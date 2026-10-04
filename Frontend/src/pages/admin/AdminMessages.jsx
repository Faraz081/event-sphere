import React from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import MessagesPanel from "@/components/shared/MessagesPanel";

const AdminMessages = () => (
  <DashboardLayout role="admin">
    <div className="p-4 md:p-8">
      <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-2">Messages</h1>
      <p className="text-muted text-sm md:text-base mb-6">Reply to exhibitor inquiries and support requests.</p>
      <MessagesPanel />
    </div>
  </DashboardLayout>
);

export default AdminMessages;