import React from "react";
import DashboardLayout from "./DashboardLayout";

const AttendeeLayout = ({ children }) => (
  <DashboardLayout role="attendee">{children}</DashboardLayout>
);

export default AttendeeLayout;

