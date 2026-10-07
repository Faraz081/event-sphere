import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Search, RotateCcw, AlertCircle, Inbox, CalendarDays, Building2, Store, Check, X } from "lucide-react";

import DashboardLayout from "@/layouts/DashboardLayout";
import { fetchPendingEvents, approveEvent, rejectEvent } from "@/store/slices/eventSlice";

const statusStyles = {
  pending: "bg-gold/20 text-gold border border-gold/40",
  approved: "bg-emerald/20 text-emerald-300 border border-emerald/40",
  rejected: "bg-red-500/15 text-red-300 border border-red-500/30",
};

const statusLabels = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const formatDate = (isoDate) => {
  if (!isoDate) return "-";
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const EventCard = ({ event, onRefresh }) => {
  const dispatch = useDispatch();
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  const handleApprove = async () => {
    try {
      setBusy(true);
      await dispatch(approveEvent(event._id)).unwrap();
      toast.success("Event approved successfully");
      onRefresh();
    } catch (msg) {
      toast.error(typeof msg === "string" ? msg : "Failed to approve event");
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error("Please add a reason for rejection");
      return;
    }

    try {
      setBusy(true);
      await dispatch(rejectEvent({ id: event._id, reason: reason.trim() })).unwrap();
      toast.success("Event rejected");
      setRejecting(false);
      setReason("");
      onRefresh();
    } catch (msg) {
      toast.error(typeof msg === "string" ? msg : "Failed to reject event");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[event.status] ?? statusStyles.pending}`}>
              {statusLabels[event.status] ?? event.status}
            </span>
            {event.eventType && (
              <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted">
                {event.eventType}
              </span>
            )}
          </div>

          <h3 className="mt-3 text-lg font-semibold text-foreground">{event.title}</h3>

          <p className="mt-1 text-sm text-muted">
            Submitted {new Date(event.createdAt).toLocaleString()}
          </p>
        </div>

        {event.images?.length > 0 && (
          <div className="flex gap-2">
            {event.images.slice(0, 3).map((image, index) => (
              <img
                key={index}
                src={image}
                alt={event.title}
                className="h-16 w-16 rounded-lg border border-border object-cover"
              />
            ))}
          </div>
        )}
      </div>

      <p className="mt-4 text-sm leading-6 text-muted">{event.description}</p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-background px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-muted">
            <Building2 size={14} />
            Exhibitor
          </div>
          <p className="mt-1 text-sm font-medium text-foreground">
            {event.exhibitor?.name ?? "Unknown"}
          </p>
          {event.exhibitor?.companyName && (
            <p className="mt-0.5 text-xs text-muted">{event.exhibitor.companyName}</p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-background px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-muted">
            <CalendarDays size={14} />
            Event Date
          </div>
          <p className="mt-1 text-sm font-medium text-foreground">{formatDate(event.date)}</p>
        </div>

        <div className="rounded-xl border border-border bg-background px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-muted">
            <Store size={14} />
            Stall Capacity
          </div>
          <p className="mt-1 text-sm font-medium text-foreground">
            {event.boothCapacity} stalls
          </p>
        </div>
      </div>

      {event.status === "pending" && (
        <div className="mt-5 border-t border-border pt-4">
          {!rejecting ? (
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleApprove}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                <Check size={16} />
                {busy ? "Please wait..." : "Approve Event"}
              </button>

              <button
                onClick={() => setRejecting(true)}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/20 disabled:opacity-40"
              >
                <X size={16} />
                Reject
              </button>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-start">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="Reason for rejection"
                className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold/40"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setRejecting(false);
                    setReason("");
                  }}
                  disabled={busy}
                  className="rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
                >
                  Cancel
                </button>

                <button
                  onClick={handleReject}
                  disabled={busy}
                  className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  {busy ? "Saving..." : "Confirm Reject"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {event.status === "rejected" && event.rejectionReason && (
        <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          Reason: {event.rejectionReason}
        </p>
      )}
    </div>
  );
};

const AdminEvents = () => {
  const dispatch = useDispatch();
  const { pendingEvents, loading, error } = useSelector((state) => state.event);
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    dispatch(fetchPendingEvents())
      .unwrap()
      .catch((msg) => toast.error(typeof msg === "string" ? msg : "Failed to load events"));
  }, [dispatch]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (!q) return pendingEvents;

    return pendingEvents.filter((event) =>
      [
        event.title,
        event.eventType,
        event.exhibitor?.name,
        event.exhibitor?.email,
        event.exhibitor?.companyName,
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q))
    );
  }, [pendingEvents, search]);

  return (
    <DashboardLayout role="admin">
      <div className="p-4 md:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-2 font-display text-2xl font-bold text-foreground md:text-4xl">
              Event Approvals
            </h1>
            <p className="text-sm text-muted md:text-base">
              Review events submitted by exhibitors and approve or reject them.
              {pendingEvents.length > 0 && (
                <span className="ml-2 font-semibold text-gold">
                  {pendingEvents.length} pending
                </span>
              )}
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

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />

            <input
              type="text"
              placeholder="Search event, exhibitor or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold/40"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            <AlertCircle size={18} />
            <span>{typeof error === "string" ? error : error?.error || error?.msg || "Failed to load events"}</span>
          </div>
        )}

        {loading && pendingEvents.length === 0 && (
          <p className="py-12 text-center text-muted">Loading events...</p>
        )}

        {!loading && visible.length === 0 && (
          <div className="py-12 text-center text-muted">
            <Inbox className="mx-auto mb-2 opacity-40" size={32} />
            <p>{search ? "No events found for your search." : "No pending events."}</p>
          </div>
        )}

        <div className="space-y-4">
          {visible.map((event) => (
            <EventCard key={event._id} event={event} onRefresh={load} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminEvents;