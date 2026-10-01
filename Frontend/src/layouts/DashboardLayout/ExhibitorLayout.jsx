import React from "react";
import DashboardLayout from "./DashboardLayout";

const ExhibitorLayout = ({ children }) => (
  <DashboardLayout role="exhibitor">{children}</DashboardLayout>
);

export default ExhibitorLayout;

