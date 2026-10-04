import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Plus, Trash2, Check, X } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import DashboardSectionPage from "@/components/shared/DashboardSectionPage";
import { fetchMyEvents, createEvent, deleteEvent, fetchBookingRequests, approveBooking, rejectBooking } from "@/store/slices/eventSlice";

const statusStyles = {
  pending: "bg-gold/20 text-gold border border-gold/40",
  confirmed: "bg-emerald/20 text-emerald-300 border border-emerald/40",
  cancelled: "bg-red-500/20 text-red-300 border border-red-500/30",
};
const statusLabels = { pending: "Pending", confirmed: "Approved", cancelled: "Rejected" };
const statusOrder = { pending: 0, confirmed: 1, cancelled: 2 };

const ExhibitorEvents = () => {
  const dispatch = useDispatch();
  const { events, requests, loading } = useSelector((state) => state.event);
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectNote, setRejectNote] = useState("");

  useEffect(() => {
    dispatch(fetchMyEvents());
    dispatch(fetchBookingRequests());
  }, [dispatch]);

  const handleCreate = async () => {
    if(!title.trim() || !description.trim() || !date){
      toast.error("Please fill in all fields");
      return;
    }
    const result = await dispatch(createEvent({title, description, date}));
    if(createEvent.fulfilled.match(result)){
      toast.success("Event created successfully");
      setTitle("");
      setDescription("");
      setDate("");
      setFormOpen(false);
      dispatch(fetchMyEvents());
    } else {
      toast.error(result.payload?.error || "Could not create event");
    }
  };

  const handleDelete = async (eventId) => {
    if(!window.confirm("Delete this event? Its ticket requests will be cancelled.")) return;
    const result = await dispatch(deleteEvent(eventId));
    if(deleteEvent.fulfilled.match(result)){
      toast.success("Event deleted");
    } else {
      toast.error(result.payload?.error || "Could not delete event");
    }
  };

  const handleApprove = async (id) => {
    const result = await dispatch(approveBooking(id));
    if(approveBooking.fulfilled.match(result)){
      toast.success("Ticket approved");
    } else {
      toast.error(result.payload?.error || "Could not approve ticket");
    }
  };

  const handleReject = async (id) => {
    if(!rejectNote.trim()){
      toast.error("Please add a reason for rejection");
      return;
    }
    const result = await dispatch(rejectBooking({id, note: rejectNote.trim()}));
    if(rejectBooking.fulfilled.match(result)){
      toast.success("Ticket rejected");
      setRejectingId(null);
      setRejectNote("");
    } else {
      toast.error(result.payload?.error || "Could not reject ticket");
    }
  };

  const sortedRequests = [...requests].sort((a, b) => statusOrder[a.bookingStatus] - statusOrder[b.bookingStatus]);
  const pendingCount = requests.filter((r) => r.bookingStatus === "pending").length;

  return (
    <DashboardLayout role="exhibitor">
      <DashboardSectionPage
        title="Events & Tickets"
        description="Create showcase events for your booth and approve ticket requests from attendees."
      >
        <div className="mb-6">
          <button onClick={() => setFormOpen(!formOpen)} className="flex items-center gap-2 rounded-lg bg-gold text-background px-4 py-2 text-sm font-medium">
            <Plus size={16} /> New Event
          </button>
        </div>

        {formOpen && (
          <div className="mb-6 rounded-2xl border border-border bg-surface p-6 space-y-4">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Event description" rows={3} className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground" />
            <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground" />
            <button onClick={handleCreate} className="w-full rounded-lg bg-gold text-background py-2 text-sm font-medium">Create Event</button>
          </div>
        )}

        {loading && <p className="text-sm text-muted">Loading...</p>}

        {!loading && events.length === 0 && (
          <p className="text-sm text-muted">You haven't created any events yet. You need an approved booth to create one.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => (
            <div key={event._id} className="rounded-2xl border border-border bg-surface p-4 space-y-2">
              <div className="flex items-start justify-between">
                <p className="font-semibold text-foreground">{event.title}</p>
                <button onClick={() => handleDelete(event._id)}><Trash2 size={14} className="text-muted hover:text-red-400" /></button>
              </div>
              <p className="text-sm text-muted">{event.description}</p>
              <p className="text-xs font-mono text-gold">{new Date(event.date).toLocaleString()}</p>
              {(event.expo?.title || event.booth?.boothNumber) && (
                <p className="text-xs text-muted">
                  {event.expo?.title}{event.booth?.boothNumber ? ` · Booth ${event.booth.boothNumber}` : ""}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Ticket requests */}
        <div className="mt-10">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">Ticket Requests</h2>
            {pendingCount > 0 && (
              <span className="rounded-full bg-gold px-2.5 py-0.5 text-xs font-semibold text-background">{pendingCount} pending</span>
            )}
          </div>

          {requests.length === 0 && (
            <p className="text-sm text-muted">No ticket requests yet.</p>
          )}

          <div className="space-y-3">
            {sortedRequests.map((r) => (
              <div key={r._id} className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{r.user?.name ?? "Attendee"}</p>
                    <p className="text-xs text-muted">{r.user?.email}{r.user?.phone ? ` · ${r.user.phone}` : ""}</p>
                    <p className="mt-1 text-sm text-muted">
                      Event: <span className="text-foreground">{r.event?.title ?? r.eventName}</span>
                    </p>
                    <p className="text-xs text-muted">Requested {new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[r.bookingStatus]}`}>
                    {statusLabels[r.bookingStatus] ?? r.bookingStatus}
                  </span>
                </div>

                {r.bookingStatus === "confirmed" && r.passCode && (
                  <p className="mt-3 text-sm text-muted">Pass code: <span className="font-mono text-gold">{r.passCode}</span></p>
                )}

                {r.bookingStatus === "cancelled" && r.decisionNote && (
                  <p className="mt-3 text-sm text-red-300">Reason: {r.decisionNote}</p>
                )}

                {r.bookingStatus === "pending" && rejectingId !== r._id && (
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => handleApprove(r._id)} className="flex items-center gap-1.5 rounded-lg bg-gold text-background px-4 py-2 text-sm font-medium">
                      <Check size={14} /> Approve
                    </button>
                    <button onClick={() => { setRejectingId(r._id); setRejectNote(""); }} className="flex items-center gap-1.5 rounded-lg border border-red-500/40 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-500/10">
                      <X size={14} /> Reject
                    </button>
                  </div>
                )}

                {r.bookingStatus === "pending" && rejectingId === r._id && (
                  <div className="mt-4 space-y-2">
                    <textarea value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} rows={2} placeholder="Reason for rejection (the attendee will see this)" className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground" />
                    <div className="flex gap-2">
                      <button onClick={() => handleReject(r._id)} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white">Confirm reject</button>
                      <button onClick={() => setRejectingId(null)} className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:text-foreground">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </DashboardSectionPage>
    </DashboardLayout>
  );
};

export default ExhibitorEvents;