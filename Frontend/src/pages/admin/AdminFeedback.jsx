import React, { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { fetchFeedback, updateFeedback } from "@/api/feedbackService";
import { toast } from "sonner";
import { Search, RotateCcw, AlertCircle, Inbox, Star } from "lucide-react";

const statusStyles = {
  new: "bg-gold/20 text-gold border border-gold/40",
  reviewed: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  resolved: "bg-emerald/20 text-emerald-300 border border-emerald/40",
};

const typeStyles = {
  suggestion: "bg-surface text-muted border border-border",
  issue: "bg-red-500/15 text-red-300 border border-red-500/30",
  other: "bg-surface text-muted border border-border",
};

const FeedbackCard = ({ item, onSaved }) => {
  const [status, setStatus] = useState(item.status);
  const [note, setNote] = useState(item.adminNote ?? "");
  const [saving, setSaving] = useState(false);

  const dirty = status !== item.status || note !== (item.adminNote ?? "");

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateFeedback(item._id, { status, adminNote: note });
      toast.success("Feedback updated");
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update feedback");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${typeStyles[item.type]}`}>{item.type}</span>
            <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${statusStyles[item.status]}`}>{item.status}</span>
            {item.rating && (
              <span className="inline-flex items-center gap-1 text-xs text-gold">
                <Star size={12} className="fill-gold" /> {item.rating}/5
              </span>
            )}
          </div>
          {item.subject && <h3 className="mt-3 font-semibold text-foreground">{item.subject}</h3>}
        </div>
        <p className="text-xs text-muted">{new Date(item.createdAt).toLocaleString()}</p>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground">{item.message}</p>

      <p className="mt-3 text-xs text-muted">
        From <span className="text-foreground">{item.user?.name ?? "Deleted user"}</span>
        {item.user?.role ? ` (${item.user.role})` : ""}
        {item.user?.email ? ` · ${item.user.email}` : ""}
      </p>

      <div className="mt-4 grid gap-3 border-t border-border pt-4 md:grid-cols-[180px_1fr_auto] md:items-start">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40"
        >
          <option value="new">New</option>
          <option value="reviewed">Reviewed</option>
          <option value="resolved">Resolved</option>
        </select>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Internal note (optional)"
          className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold/40"
        />

        <button
          onClick={handleSave}
          disabled={!dirty || saving}
          className="rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

const AdminFeedback = () => {
  const [items, setItems] = useState([]);
  const [newCount, setNewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "all") params.status = statusFilter;
      if (typeFilter !== "all") params.type = typeFilter;
      const data = await fetchFeedback(params);
      setItems(data.feedback ?? []);
      setNewCount(data.newCount ?? 0);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load feedback");
      toast.error("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, typeFilter]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <DashboardLayout role="admin">
      <div className="p-4 md:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-2 font-display text-2xl font-bold text-foreground md:text-4xl">Feedback</h1>
            <p className="text-sm text-muted md:text-base">
              Suggestions and issues submitted by users.
              {newCount > 0 && <span className="ml-2 font-semibold text-gold">{newCount} new</span>}
            </p>
          </div>

          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 self-start rounded-xl border border-border bg-surface px-3.5 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            <RotateCcw size={16} className={loading ? "animate-spin text-gold" : ""} />
            Refresh
          </button>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input
              type="text"
              placeholder="Search subject or message..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-border bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-border bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40"
          >
            <option value="all">All Types</option>
            <option value="suggestion">Suggestions</option>
            <option value="issue">Issues</option>
            <option value="other">Other</option>
          </select>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {loading && <p className="py-12 text-center text-muted">Loading feedback...</p>}

        {!loading && items.length === 0 && (
          <div className="py-12 text-center text-muted">
            <Inbox className="mx-auto mb-2 opacity-40" size={32} />
            No feedback found.
          </div>
        )}

        <div className="space-y-4">
          {!loading && items.map((item) => (
            <FeedbackCard key={`${item._id}-${item.updatedAt}`} item={item} onSaved={load} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminFeedback;