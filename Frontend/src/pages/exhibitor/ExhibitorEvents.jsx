import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import ExhibitorLayout from "@/layouts/DashboardLayout/ExhibitorLayout";
import DashboardSectionPage from "@/components/DashboardSectionPage";
import { fetchMyEvents, createEvent, deleteEvent } from "@/features/eventSlice";

const ExhibitorEvents = () => {
  const dispatch = useDispatch();
  const { events, loading } = useSelector((state) => state.event);
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    dispatch(fetchMyEvents());
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
    } else {
      toast.error(result.payload?.error || "Could not create event");
    }
  };

  const handleDelete = async (eventId) => {
    const result = await dispatch(deleteEvent(eventId));
    if(deleteEvent.fulfilled.match(result)){
      toast.success("Event deleted");
    } else {
      toast.error(result.payload?.error || "Could not delete event");
    }
  };

  return (
    <ExhibitorLayout>
      <DashboardSectionPage
        title="My Events"
        description="Create showcase events for your booth. Approved events appear on the public landing page."
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
          <p className="text-sm text-muted">You haven't created any events yet.</p>
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
            </div>
          ))}
        </div>
      </DashboardSectionPage>
    </ExhibitorLayout>
  );
};

export default ExhibitorEvents;