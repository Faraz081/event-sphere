import React, {useEffect, useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import DashboardSectionPage from "@/components/shared/DashboardSectionPage";
import { fetchBookingRequests, approveBooking, rejectBooking } from "@/store/slices/eventSlice";

const badge = {
  pending: "bg-gold/20 text-gold border border-gold/40",
  confirmed: "bg-emerald/20 text-emerald-300 border border-emerald/40",
  approved: "bg-emerald/20 text-emerald-300 border border-emerald/40",
  cancelled: "bg-red-500/20 text-red-300 border border-red-500/30",
  rejected: "bg-red-500/20 text-red-300 border border-red-500/30",
};

const statusLabels = {
  pending: "Pending",
  confirmed: "Approved",
  approved: "Approved",
  cancelled: "Rejected",
  rejected: "Rejected",
};

const statusOrder = { pending: 0, confirmed: 1, approved: 1, cancelled: 2, rejected: 2 };

const FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

const groupOf = (status) =>
  status === "confirmed" || status === "approved" ? "approved" : status === "cancelled" || status === "rejected"
    ? "rejected" : "pending";

const ExhibitorBookings = () => {
  const dispatch = useDispatch();
  const { requests, loading } = useSelector((state) => state.event);
  const [filter, setFilter] = useState("all");
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectNote, setRejectNote] = useState("");

  const field = "w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground";

  useEffect(() => {
    dispatch(fetchBookingRequests());
  }, [dispatch]);

  const handleApprove = async (id) => {
    const result = await dispatch(approveBooking(id));

    if (approveBooking.fulfilled.match(result)) {
      toast.success("Booking approved");
      dispatch(fetchBookingRequests());
    } else {
      toast.error(result.payload?.error || "Could not approve booking");
    }
  };

  const handleReject = async (id) => {
    if (!rejectNote.trim()) {
      toast.error("Please add a reason for rejection");
      return;
    }

    const result = await dispatch(rejectBooking({ id, note: rejectNote.trim() }));

    if (rejectBooking.fulfilled.match(result)) {
      toast.success("Booking rejected");
      setRejectingId(null);
      setRejectNote("");
      dispatch(fetchBookingRequests());
    } else {
      toast.error(result.payload?.error || "Could not reject booking");
    }
  };

  const sortedRequests = [...requests].sort(
    (a, b) => (statusOrder[a.bookingStatus] ?? 3) - (statusOrder[b.bookingStatus] ?? 3)
  );

  const visibleRequests =
    filter === "all" ? sortedRequests : sortedRequests.filter((r) => groupOf(r.bookingStatus) === filter);

  const countOf = (key) =>
    key === "all" ? requests.length : requests.filter((r) => groupOf(r.bookingStatus) === key).length;

  return (
    <DashboardLayout role="exhibitor">
      <DashboardSectionPage title="Booking Requests" description="Attendees who want to book your events. Approve or reject each request.">
        <div className="mb-6 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button key={f.key} type="button" onClick={() => setFilter(f.key)} className={`rounded-full border px-4 py-1.5 text-sm transition
               ${filter === f.key ? "border-gold bg-gold text-background" : "border-border text-muted hover:border-gold/40 hover:text-foreground"}`}>
              {f.label} ({countOf(f.key)})
            </button>
          ))}
        </div>

        {loading && <p className="text-sm text-muted">Loading...</p>}

        {!loading && !visibleRequests.length && (
          <p className="text-sm text-muted">
            {requests.length ? "No requests in this filter." : "No booking requests yet."}
          </p>
        )}

        <div className="space-y-3">
          {visibleRequests.map((r) => (
            <div key={r._id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="font-semibold text-foreground">{r.user?.name || "Attendee"}</p>
                  <p className="text-xs text-muted">
                    {r.user?.email}{r.user?.phone ? ` · ${r.user.phone}` : ""}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {r.isCustomEvent ? "Custom event: " : "Event: "}
                    <span className="text-foreground">{r.customEventName || r.event?.title || r.eventName || "Event"}</span>
                  </p>
                  {r.customEventImage && (
                    <img src={r.customEventImage} alt={r.customEventName || "Custom event"} className="mt-2 h-24 w-full max-w-xs rounded-lg object-cover" />
                  )}
                  <p className="text-xs text-muted">Requested {new Date(r.createdAt).toLocaleDateString()}</p>

                  {r.eventDate && (
                    <p className="text-xs text-muted">
                      Event date: <span className="text-foreground">{new Date(r.eventDate).toLocaleDateString()}</span>
                    </p>
                  )}
                  {r.guests && <p className="text-xs text-muted">Guests: <span className="text-foreground">{r.guests}</span></p>}
                  {!!r.stallNumbers?.length && (
                    <p className="text-xs text-muted">Stalls: <span className="text-foreground">{r.stallNumbers.join(", ")}</span></p>
                  )}
                  {r.contactPhone && <p className="text-xs text-muted">Contact: <span className="text-foreground">{r.contactPhone}</span></p>}
                  {r.notes && <p className="text-xs text-muted">Note: <span className="text-foreground">{r.notes}</span></p>}
                </div>

                <span className={`rounded-full border px-3 py-1 text-xs ${badge[r.bookingStatus] || badge.pending}`}>
                  {statusLabels[r.bookingStatus] || r.bookingStatus}
                </span>
              </div>

              {r.decisionNote && (
                <p className="mt-2 text-sm text-red-300">Reason: {r.decisionNote}</p>
              )}

              {r.bookingStatus === "pending" && rejectingId !== r._id && (
                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={() => handleApprove(r._id)} className="flex items-center gap-1.5 rounded-lg bg-gold px-4 py-2 text-sm font-medium text-background">
                    <Check size={14} /> Approve
                  </button>
                  <button type="button" onClick={() => { setRejectingId(r._id); setRejectNote("");}} className="flex items-center gap-1.5 rounded-lg border border-red-500/40 px-4 py-2 text-sm font-medium text-red-300">
                    <X size={14} /> Reject
                  </button>
                </div>
              )}

              {r.bookingStatus === "pending" && rejectingId === r._id && (
                <div className="mt-4 space-y-2">
                  <textarea value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} rows={2} placeholder="Reason for rejection" className={field}/>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleReject(r._id)} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white">
                      Confirm reject
                    </button>
                    <button type="button" onClick={() => setRejectingId(null)} className="rounded-lg border border-border px-4 py-2 text-sm text-muted">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </DashboardSectionPage>
    </DashboardLayout>
  );
};

export default ExhibitorBookings;
