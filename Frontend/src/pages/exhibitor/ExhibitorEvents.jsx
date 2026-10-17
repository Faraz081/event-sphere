import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Plus, Trash2, Pencil } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import DashboardSectionPage from "@/components/shared/DashboardSectionPage";
import EventStalls from "@/components/shared/EventStalls";
import { fetchMyEvents, createEvent, updateEvent, deleteEvent, uploadEventImage } from "@/store/slices/eventSlice";

const BASE = import.meta.env.VITE_API_URL || "";
const img = (url) => url?.startsWith("http") ? url : `${BASE}${url || ""}`;

const badge = {
  pending: "bg-gold/20 text-gold border border-gold/40",
  approved: "bg-emerald/20 text-emerald-300 border border-emerald/40",
  rejected: "bg-red-500/20 text-red-300 border border-red-500/30",
};

const ExhibitorEvents = () => {
  const dispatch = useDispatch();
  const { events, loading } = useSelector((state) => state.event);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [eventType, setEventType] = useState("");
  const [boothCapacity, setBoothCapacity] = useState("");
  const [eventPrice, setEventPrice] = useState("");
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const field = "w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground";

  useEffect(() => {
    dispatch(fetchMyEvents());
  }, [dispatch]);

  useEffect(() => {
  if (!formOpen) return;
  const onKey = (e) => e.key === "Escape" && !uploadingImages && resetForm();
  document.body.style.overflow = "hidden";
  window.addEventListener("keydown", onKey);
  return () => {
    document.body.style.overflow = "";
    window.removeEventListener("keydown", onKey);
  };
}, [formOpen, uploadingImages]);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setLocation("");
    setEventType("");
    setBoothCapacity("");
    setEventPrice("");
    setImages([]);
    setExistingImages([]);
    setFormOpen(false);
  };

 const handleNewEvent = () => {
  resetForm();
  setFormOpen(true);
};

  const handleEdit = (event) => {
  setEditingId(event._id);
  setTitle(event.title ?? "");
  setDescription(event.description ?? "");
  setLocation(event.location ?? "");
  setEventType(event.eventType ?? "");
  setBoothCapacity(String(event.boothCapacity ?? ""));
  setEventPrice(String(event.price ?? 0));
  setExistingImages(event.images ?? []);
  setImages([]);
  setFormOpen(true);
};

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !eventType.trim() || !location.trim() || !boothCapacity || eventPrice === "") {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!Number.isFinite(Number(eventPrice)) || Number(eventPrice) < 0) {
      toast.error("Event price must be a valid non-negative amount");
      return;
    }

    if (!Number.isInteger(Number(boothCapacity)) || Number(boothCapacity) < 1) {
      toast.error("Capacity must be a whole number of at least 1");
      return;
    }

    try {
      setUploadingImages(true);

      const imageUrls = [...existingImages];
      for (const file of images) {
        if (!file.type.startsWith("image/")) {
          throw new Error(`"${file.name}" is not an image.`);
        }
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`"${file.name}" is larger than 10MB.`);
        }

        const uploaded = await dispatch(uploadEventImage(file)).unwrap();
        if (!uploaded?.image?.url) {
          throw new Error("Could not upload an event image");
        }
          imageUrls.push(uploaded.image.url);
      }

      const payload = {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        eventType: eventType.trim(),
        boothCapacity: Number(boothCapacity),
        price: Number(eventPrice),
        images: imageUrls,
      };

      const result = editingId ? await dispatch(updateEvent({ id: editingId, data: payload })) : await dispatch(createEvent(payload));
      const action = editingId ? updateEvent : createEvent;

      if (action.fulfilled.match(result)) {
        toast.success(
          result.payload?.msg ||
            (editingId ? "Event updated and submitted for approval" : "Event submitted for approval")
        );
        resetForm();
        dispatch(fetchMyEvents());
      } else {
        toast.error(result.payload?.error || result.payload?.msg || "Could not save event");
      }
    } catch (error) {
      toast.error(error?.message || error?.error || "Could not upload event images");
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm("Delete this event? Its booking requests may also be cancelled.")) return;

    const result = await dispatch(deleteEvent(eventId));

    if (deleteEvent.fulfilled.match(result)) {
      toast.success("Event deleted");
      if (editingId === eventId) resetForm();
    } else {
      toast.error(result.payload?.error || "Could not delete event");
    }
  };

  return (
    <DashboardLayout role="exhibitor">
      <DashboardSectionPage title="My Events" description="Create and manage your events. New and edited events go to the admin for approval.">
        <div className="mb-6">
          <button type="button" onClick={handleNewEvent} className="flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-medium text-background">
            <Plus size={16} /> New Event
          </button>
        </div>

      {formOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => !uploadingImages && resetForm()}>
    <div className="max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-2xl border border-border bg-surface p-5" onClick={(e) => e.stopPropagation()}>
      <h3 className="text-base font-semibold text-foreground">
        {editingId ? "Edit Event" : "Create Event"}
      </h3>

      {editingId && (
        <p className="rounded-lg border border-gold/40 bg-gold/10 p-2 text-xs text-gold">
          Saving changes may send this event back to admin approval.
        </p>
      )}

      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title *" className={field}/>

      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Event description *" rows={3} className={field}/>

      <select value={eventType} onChange={(e) => setEventType(e.target.value)} className={field}>
        <option value="">Select event type *</option>
        <option value="Wedding">Wedding</option>
        <option value="Birthday">Birthday</option>
        <option value="Corporate">Corporate</option>
        <option value="Exhibition">Exhibition</option>
        <option value="Festival">Festival</option>
        <option value="Conference">Conference</option>
        <option value="Workshop">Workshop</option>
        <option value="Demo">Demo</option>
        <option value="Talk">Talk</option>
        <option value="Product Launch">Product Launch</option>
        <option value="Networking">Networking</option>
        <option value="Other">Other</option>
      </select>

      <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Event location *" className={field}/>

      <input type="number" min="1" step="1" value={boothCapacity} onChange={(e) => setBoothCapacity(e.target.value)} placeholder="Maximum number of stalls *" className={field}/>

      <input type="number" min="0" step="0.01" value={eventPrice} onChange={(e) => setEventPrice(e.target.value)} placeholder="Event price (Rs.) *" className={field}/>

      <div className={`${field} flex items-center gap-3`}>
        <span className="shrink-0 text-sm text-muted">Images</span>
        <input type="file" accept="image/*" multiple onChange={(e) => setImages(Array.from(e.target.files || []))} disabled={uploadingImages} className="min-w-0 flex-1 text-sm text-foreground"/>
      </div>

      {images.length > 0 && (
        <p className="text-xs text-muted">{images.length} new image(s) selected</p>
      )}

      {!!existingImages.length && (
        <div className="flex flex-wrap gap-2">
          {existingImages.map((url) => (
            <div key={url} className="relative">
              <img src={img(url)} alt="" className="h-14 w-14 rounded-lg border border-border object-cover"/>
              <button type="button" onClick={() => setExistingImages((prev) => prev.filter((item) => item !== url))} className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1 text-[10px] text-white" aria-label="Remove existing image">
                x
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <button type="button" onClick={handleSubmit} disabled={uploadingImages} className="flex-1 rounded-lg bg-gold py-2 text-sm font-medium text-background disabled:opacity-50">
          {uploadingImages ? "Please wait..." : editingId ? "Save Changes" : "Submit Event"}
        </button>

        <button type="button" onClick={resetForm} disabled={uploadingImages} className="rounded-lg border border-border px-4 py-2 text-sm text-muted">
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

        {loading && <p className="text-sm text-muted">Loading...</p>}

        {!loading && !events.length && (
          <p className="text-sm text-muted">No events yet. Click "New Event" to create your first one.</p>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {events.map((event) => (
            <div key={event._id} className="space-y-2 rounded-2xl border border-border bg-surface p-4">

              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-foreground">{event.title}</p>
                  {event.status && (
                    <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-xs capitalize ${badge[event.status] || badge.pending}`}>
                      {event.status}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => handleEdit(event)} aria-label="Edit event">
                    <Pencil size={14} className="text-muted hover:text-gold" />
                  </button>
                  <button type="button" onClick={() => handleDelete(event._id)} aria-label="Delete event">
                    <Trash2 size={14} className="text-muted hover:text-red-400" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-muted">{event.description}</p>
              <p className="text-xs text-gold">Type: <span className="text-foreground">{event.eventType}</span></p>
              <p className="text-xs text-gold">Location: <span className="text-foreground">{event.location || "Not set"}</span></p>
              <p className="text-xs text-gold">Stall capacity: <span className="text-foreground">{event.boothCapacity}</span></p>
              <p className="text-xs text-gold">Event price: <span className="text-foreground">Rs. {(event.price ?? 0).toLocaleString()}</span></p>

              {!!event.images?.length && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {event.images.map((url, index) => (
                    <img key={`${url}-${index}`} src={img(url)} alt={event.title} className="h-16 w-16 rounded-lg border border-border object-cover"/>
                  ))}
                </div>
              )}

              {event.rejectionReason && (
                <p className="text-xs text-red-300">Rejection reason: {event.rejectionReason}</p>
              )}

              <EventStalls event={event} />
            </div>
          ))}
        </div>
      </DashboardSectionPage>
    </DashboardLayout>
  );
};

export default ExhibitorEvents;
