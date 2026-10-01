import React from "react";
import DashboardLayout from "./DashboardLayout";

const AdminLayout = ({ children }) => (
  <DashboardLayout role="admin">{children}</DashboardLayout>
);

export default AdminLayout;

