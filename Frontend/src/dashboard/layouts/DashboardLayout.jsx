import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Bell,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { logout } from "@/features/auth/authSlice";
import {
  dashboardNavigation,
  dashboardNotifications,
  getRoleHomePath,
  roleLabels,
} from "@/dashboard/dashboardConfig";
import { toast } from "sonner";

const navLinkClassName = ({ isActive }) =>
  [
    "flex items-center gap-3 rounded-xl border-l-4 px-4 py-3 text-sm font-medium transition-colors",
    isActive
      ? "border-gold bg-gold/10 text-gold"
      : "border-transparent text-muted hover:border-gold hover:bg-surface hover:text-foreground",
  ].join(" ");

const DashboardLayout = ({ role, children }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { currentUser } = useSelector((state) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navigation = dashboardNavigation[role] ?? [];
  const notifications = dashboardNotifications[role] ?? [];

  useEffect(() => {
    setMobileMenuOpen(false);
    setNotificationsOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully.");
    navigate("/login");
  };

  const handleHomeClick = () => {
    navigate(getRoleHomePath(role));
  };

  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside
          className={[
            "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-surface/95 backdrop-blur md:static md:z-auto md:flex",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
            "transform transition-transform duration-300 ease-out",
          ].join(" ")}
        >
          <div className="border-b border-border px-6 py-5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleHomeClick}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-background text-gold"
                aria-label="Go to dashboard home"
              >
                <LayoutDashboard size={20} />
              </button>
              <div>
                <h1 className="font-display text-2xl font-bold text-gold">
                  EventSphere
                </h1>
                <p className="text-sm text-muted">
                  {roleLabels[role]} Portal
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto p-4">
            {navigation.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === getRoleHomePath(role)}
                className={navLinkClassName}
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {mobileMenuOpen && (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/60 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation"
          />
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
            <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-6">
              <div className="relative flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((open) => !open)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface text-foreground md:hidden"
                  aria-label="Toggle navigation"
                >
                  {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>

                <div>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {roleLabels[role]} Portal
                  </p>
                </div>
              </div>

              <div className="relative flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen((open) => !open);
                    setProfileOpen(false);
                  }}
                  className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface text-foreground transition-colors hover:bg-background"
                  aria-label="Open notifications"
                >
                  <Bell size={18} />
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-gold" />
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen((open) => !open);
                      setNotificationsOpen(false);
                    }}
                    className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2 text-left transition-colors hover:bg-background"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15 text-gold">
                      {currentUser?.name?.[0] ?? "U"}
                    </div>
                    <div className="hidden text-left sm:block">
                      <p className="text-sm font-medium text-foreground">
                        {currentUser?.name ?? "User"}
                      </p>
                      <p className="text-xs text-muted">
                        {roleLabels[role]}
                      </p>
                    </div>
                    <ChevronDown size={16} className="text-muted" />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-3 w-64 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-surface p-4 shadow-2xl shadow-black/30">
                      <div className="mb-4 border-b border-border pb-4">
                        <p className="text-sm font-semibold text-foreground">
                          {currentUser?.name}
                        </p>
                        <p className="text-xs text-muted">{currentUser?.email}</p>
                        <div className="mt-3 inline-flex rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted">
                          {roleLabels[role]} account
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-muted transition-colors hover:bg-background hover:text-red-400"
                      >
                        <LogOut size={16} />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>

                {notificationsOpen && (
                  <div className="absolute right-0 top-16 z-30 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-surface p-4 shadow-2xl shadow-black/30">
                    <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
                      <p className="text-sm font-semibold text-foreground">
                        Notifications
                      </p>
                      <span className="text-xs text-muted">
                        {notifications.length} new
                      </span>
                    </div>
                    <div className="space-y-3">
                      {notifications.map((item) => (
                        <div
                          key={item}
                          className="rounded-xl border border-border bg-background px-3 py-3 text-sm text-muted"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;