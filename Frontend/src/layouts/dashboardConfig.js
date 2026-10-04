import { LayoutDashboard, CalendarDays, Store, ClipboardList, BarChart3, User, Users, UserCheck, MessageSquare, Settings, Building2, Inbox } from "lucide-react";

export const roleLabels = {
  admin: "Admin",
  organizer: "Organizer",
  attendee: "Attendee",
  exhibitor: "Exhibitor",
};

export const roleHomePaths = {
  admin: "/admin",
  attendee: "/",
  exhibitor: "/exhibitor",
};

export const dashboardNavigation = {
  admin: [
    { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { label: "Users", path: "/admin/users", icon: Users },
    { label: "Attendees", path: "/admin/attendees", icon: UserCheck },
    { label: "Exhibitors", path: "/admin/exhibitors", icon: Building2 },
    { label: "Expos", path: "/admin/expos", icon: CalendarDays },
    { label: "Booths", path: "/admin/booths", icon: Store },
    { label: "Schedule", path: "/admin/schedule", icon: ClipboardList },
    { label: "Messages", path: "/admin/messages", icon: MessageSquare },
    { label: "Feedback", path: "/admin/feedback", icon: Inbox },
    { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
    { label: "Website Settings", path: "/admin/website-settings", icon: Settings },
  ],
  exhibitor: [
    { label: "Dashboard", path: "/exhibitor", icon: LayoutDashboard },
    { label: "Registration", path: "/exhibitor/registration", icon: ClipboardList },
    { label: "My Booth", path: "/exhibitor/booth", icon: Store },
    { label: "Events & Tickets", path: "/exhibitor/events", icon: CalendarDays },
    { label: "Messages", path: "/exhibitor/messages", icon: MessageSquare },
    { label: "Profile", path: "/exhibitor/profile", icon: User },
  ],
};


export const dashboardSummaries = {
  admin: [
    { label: "Active Expos", value: 12 },
    { label: "Total Exhibitors", value: 348 },
    { label: "Registered Attendees", value: "4,215" },
    { label: "Booths Reserved", value: "89%" },
  ],
  exhibitor: [
    { label: "My Booth", value: "B-12" },
    { label: "Products", value: "18" },
    { label: "Meetings", value: "9" },
    { label: "Messages", value: "5" },
  ],
};

export const getRoleHomePath = (role) => roleHomePaths[role] ?? "/login";