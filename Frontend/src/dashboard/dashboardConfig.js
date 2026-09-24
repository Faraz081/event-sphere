import {
  LayoutDashboard,
  CalendarDays,
  Store,
  ClipboardList,
  BarChart3,
  House,
  Search,
  User,
  MessageSquare,
} from "lucide-react";

export const roleLabels = {
  admin: "Admin",
  attendee: "Attendee",
  exhibitor: "Exhibitor",
};

export const roleHomePaths = {
  admin: "/admin",
  attendee: "/attendee",
  exhibitor: "/exhibitor",
};

export const dashboardNavigation = {
  admin: [
    { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { label: "Expos", path: "/admin/expos", icon: CalendarDays },
    { label: "Booths", path: "/admin/booths", icon: Store },
    { label: "Schedule", path: "/admin/schedule", icon: ClipboardList },
    { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
  ],
  attendee: [
    { label: "Home", path: "/attendee", icon: House },
    { label: "Events", path: "/attendee/events", icon: CalendarDays },
    { label: "Exhibitors", path: "/attendee/exhibitors", icon: Search },
    { label: "Profile", path: "/attendee/profile", icon: User },
  ],
  exhibitor: [
    { label: "Dashboard", path: "/exhibitor", icon: LayoutDashboard },
    { label: "Registration", path: "/exhibitor/registration", icon: ClipboardList },
    { label: "My Booth", path: "/exhibitor/booth", icon: Store },
    { label: "Messages", path: "/exhibitor/messages", icon: MessageSquare },
    { label: "Profile", path: "/exhibitor/profile", icon: User },
  ],
};

export const dashboardNotifications = {
  admin: [
    "3 exhibitor approvals need review.",
    "Schedule changes are pending publication.",
    "Booth occupancy reached 89%.",
  ],
  attendee: [
    "2 bookmarked sessions start today.",
    "New exhibitors matched your interests.",
    "Your event pass is ready to view.",
  ],
  exhibitor: [
    "1 new lead requested a meeting.",
    "Booth setup reminder is due tomorrow.",
    "Your latest product update was approved.",
  ],
};

export const dashboardSummaries = {
  admin: [
    { label: "Active Expos", value: 12 },
    { label: "Total Exhibitors", value: 348 },
    { label: "Registered Attendees", value: "4,215" },
    { label: "Booths Reserved", value: "89%" },
  ],
  attendee: [
    { label: "Events", value: "8" },
    { label: "Sessions", value: "12" },
    { label: "Bookmarked", value: "4" },
    { label: "Exhibitors", value: "56" },
  ],
  exhibitor: [
    { label: "My Booth", value: "B-12" },
    { label: "Products", value: "18" },
    { label: "Meetings", value: "9" },
    { label: "Messages", value: "5" },
  ],
};

export const getRoleHomePath = (role) => roleHomePaths[role] ?? "/login";
