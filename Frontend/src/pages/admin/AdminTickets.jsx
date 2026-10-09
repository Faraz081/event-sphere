import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  Search,
  RotateCcw,
  AlertCircle,
  Inbox,
  CalendarDays,
  Mail,
  Phone,
  TicketCheck,
  Ban,
} from "lucide-react";

import DashboardLayout from "@/layouts/DashboardLayout";
import {
  loadTickets,
  approveTicket,
  rejectTicket,
  cancelTicket,
} from "@/store/slices/ticketSlice";

const statusStyles = {
  pending: "bg-gold/20 text-gold border border-gold/40",
  confirmed: "bg-emerald/20 text-emerald-300 border border-emerald/40",
  cancelled: "bg-red-500/15 text-red-300 border border-red-500/30",
};

const statusLabel = {
  pending: "Pending",
  confirmed: "Approved",
  cancelled: "Cancelled",
};

const getTicketTitle = (ticket) => {
  if (ticket.event?.title) return ticket.event.title;
  if (ticket.eventName) return ticket.eventName;
  if (ticket.expo?.title) return ticket.expo.title;
  return "Ticket";
};

const getTicketKind = (ticket) => {
  if (ticket.event || ticket.eventName) return "Event Ticket";
  return ticket.ticketType || "Expo Entry Pass";
};

const TicketCard = ({ ticket }) => {
  const dispatch = useDispatch();
  const [busy, setBusy] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");

  const handleApprove = async () => {
    try {
      setBusy(true);
      await dispatch(approveTicket(ticket._id)).unwrap();
      toast.success("Ticket approved, entry pass issued");
    } catch (msg) {
      toast.error(typeof msg === "string" ? msg : "Failed to approve ticket");
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    if (!note.trim()) {
      toast.error("Please add a reason for rejection");
      return;
    }
    try {
      setBusy(true);
      await dispatch(rejectTicket({ id: ticket._id, note })).unwrap();
      toast.success("Ticket rejected");
      setRejecting(false);
      setNote("");
    } catch (msg) {
      toast.error(typeof msg === "string" ? msg : "Failed to reject ticket");
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    try {
      setBusy(true);
      await dispatch(
        cancelTicket({ id: ticket._id, note: "Cancelled by admin" })
      ).unwrap();
      toast.success("Ticket cancelled");
    } catch (msg) {
      toast.error(typeof msg === "string" ? msg : "Failed to cancel ticket");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                statusStyles[ticket.bookingStatus] || statusStyles.pending
              }`}
            >
              {statusLabel[ticket.bookingStatus] ?? ticket.bookingStatus}
            </span>
            <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted">
              {getTicketKind(ticket)}
            </span>
          </div>

          <h3 className="mt-3 font-semibold text-foreground">
            {getTicketTitle(ticket)}
          </h3>

          {ticket.expo?.title && (ticket.event || ticket.eventName) && (
            <p className="mt-1 text-xs text-muted">Expo: {ticket.expo.title}</p>
          )}

          {ticket.expo?.location && (
            <p className="mt-1 text-xs text-muted">{ticket.expo.location}</p>
          )}
        </div>

        <p className="text-xs text-muted">
          Requested {new Date(ticket.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <span className="font-medium text-foreground">
          {ticket.user?.name ?? "Deleted user"}
        </span>
        {ticket.user?.email && (
          <span className="inline-flex items-center gap-1.5 text-muted">
            <Mail size={14} /> {ticket.user.email}
          </span>
        )}
        {ticket.user?.phone && (
          <span className="inline-flex items-center gap-1.5 text-muted">
            <Phone size={14} /> {ticket.user.phone}
          </span>
        )}
        {ticket.expo?.date && (
          <span className="inline-flex items-center gap-1.5 text-muted">
            <CalendarDays size={14} />{" "}
            {new Date(ticket.expo.date).toLocaleDateString()}
          </span>
        )}
      </div>

      {ticket.bookingStatus === "confirmed" && ticket.entryPassId && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-gold/30 bg-gold/10 px-4 py-3">
          <TicketCheck size={18} className="text-gold" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
              Entry pass ID
            </p>
            <p className="font-mono text-sm font-bold tracking-widest text-gold">
              {ticket.entryPassId}
            </p>
          </div>
        </div>
      )}

      {ticket.decisionNote && (
        <p className="mt-3 text-xs text-muted">Note: {ticket.decisionNote}</p>
      )}

      {ticket.bookingStatus === "pending" && !rejecting && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={handleApprove}
            disabled={busy}
            className="rounded-lg bg-gold px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "..." : "Approve"}
          </button>
          <button
            onClick={() => setRejecting(true)}
            disabled={busy}
            className="rounded-lg bg-red-500/15 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/25 disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      )}

      {ticket.bookingStatus === "pending" && rejecting && (
        <div className="mt-4 space-y-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reason for rejection"
            rows={2}
            className="w-full rounded-xl border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
          <div className="flex gap-2">
            <button
              onClick={() => {
                setRejecting(false);
                setNote("");
              }}
              className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:text-foreground"
            >
              Back
            </button>
            <button
              onClick={handleReject}
              disabled={busy}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "..." : "Confirm reject"}
            </button>
          </div>
        </div>
      )}

      {ticket.bookingStatus === "confirmed" && (
        <div className="mt-4">
          <button
            onClick={handleCancel}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/15 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/25 disabled:opacity-50"
          >
            <Ban size={14} />
            {busy ? "..." : "Cancel ticket"}
          </button>
        </div>
      )}
    </div>
  );
};

const AdminTickets = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.tickets);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const load = useCallback(() => {
    const params = {};
    if (statusFilter !== "all") params.status = statusFilter;
    if (typeFilter !== "all") params.type = typeFilter;
    if (search.trim()) params.search = search.trim();
    dispatch(loadTickets(params));
  }, [dispatch, statusFilter, typeFilter, search]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => items || [], [items]);

  return (
    <DashboardLayout role="admin">
      <div className="p-4 md:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-1">
              Expo Tickets
            </h1>
            <p className="text-muted text-sm md:text-base">
              All attendee tickets — approve, reject or cancel.
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
              placeholder="Search attendee, email, expo, event or entry pass..."
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
            <option value="pending">Pending</option>
            <option value="confirmed">Approved</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-border bg-background px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40"
          >
            <option value="all">All Types</option>
            <option value="expo">Expo Pass</option>
            <option value="event">Event Ticket</option>
          </select>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {loading && items.length === 0 && (
          <p className="py-12 text-center text-muted">Loading tickets...</p>
        )}

        {!loading && visible.length === 0 && (
          <div className="py-12 text-center text-muted">
            <Inbox className="mx-auto mb-2 opacity-40" size={32} />
            No tickets found.
          </div>
        )}

        <div className="space-y-4">
          {visible.map((ticket) => (
            <TicketCard key={ticket._id} ticket={ticket} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminTickets;