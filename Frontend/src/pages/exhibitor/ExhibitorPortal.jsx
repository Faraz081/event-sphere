import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Store, ClipboardList, User } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import StatGrid from "@/components/shared/StatGrid";
import DashboardLayout from "@/layouts/DashboardLayout";
import StatCard from "@/components/shared/StatCard";
import { fetchMyBooth } from "@/store/slices/boothSlice";
import { fetchContacts, fetchUnreadCounts } from "@/store/slices/messageSlice";

const ExhibitorPortal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myBooth } = useSelector((state) => state.booth);
  const { contacts, unread } = useSelector((state) => state.message);

  useEffect(() => {
    dispatch(fetchMyBooth());
    dispatch(fetchContacts());
    dispatch(fetchUnreadCounts());
  }, [dispatch]);

  const totalUnread = unread.reduce((sum, u) => sum + u.count, 0);

  const unreadContacts = unread
    .map((u) => ({ ...u, contact: contacts.find((c) => c._id === u._id) }))
    .filter((u) => u.contact);

  const chartData = unreadContacts.map((u) => ({ name: u.contact.name, unread: u.count }));

  const stats = [
    { label: "My Booth", value: myBooth ? myBooth.boothNumber : "Not reserved" },
    { label: "Products", value: "18" },
    { label: "Meetings", value: "9" },
    { label: "Messages", value: totalUnread },
  ];

  const quickActions = [
    { label: "Manage Registration", icon: ClipboardList, path: "/exhibitor/registration" },
    { label: "View My Booth", icon: Store, path: "/exhibitor/booth" },
    { label: "Open Messages", icon: MessageSquare, path: "/exhibitor/messages" },
    { label: "Edit Profile", icon: User, path: "/exhibitor/profile" },
  ];

  return (
    <DashboardLayout role="exhibitor">
      <div className="p-4 md:p-8">
        <h1 className="mb-2 font-display text-2xl md:text-4xl font-bold text-foreground">Exhibitor Dashboard</h1>

        <div className="mb-6">
          <p className="text-muted text-sm md:text-base">Manage your booth, products, profile, and communications from one place.</p>
        </div>

        <StatGrid>
          {stats.map((stat) => (
            <StatCard key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </StatGrid>

        <div className="mt-6 rounded-3xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Unread Messages by Contact</h2>
          {chartData.length === 0 ? (
            <p className="text-sm text-muted">No unread messages right now.</p>
          ) : (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" stroke="var(--color-muted)" fontSize={12} />
                  <YAxis stroke="var(--color-muted)" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "8px" }} />
                  <Bar dataKey="unread" fill="var(--color-gold)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
            {unreadContacts.length === 0 && (
              <p className="text-sm text-muted">No new messages right now.</p>
            )}
            <div className="space-y-3">
              {unreadContacts.map((u) => (
                <button key={u._id} onClick={() => navigate("/exhibitor/messages")} className="w-full flex items-center justify-between rounded-xl border border-border bg-background p-3 text-left hover:border-gold/40">
                  <div>
                    <p className="text-sm font-medium text-foreground">{u.contact.name}</p>
                    <p className="text-xs text-muted">{u.contact.role} sent you a message</p>
                  </div>
                  <span className="rounded-full bg-gold text-background text-xs font-semibold w-5 h-5 flex items-center justify-center">{u.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map(({ label, icon: Icon, path }) => (
                <button key={path} onClick={() => navigate(path)} className="flex flex-col items-start gap-2 rounded-xl border border-border bg-background p-4 text-left hover:border-gold/40">
                  <Icon size={18} className="text-gold" />
                  <span className="text-sm font-medium text-foreground">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ExhibitorPortal;