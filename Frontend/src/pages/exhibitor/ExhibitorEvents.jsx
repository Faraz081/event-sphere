import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Plus, Trash2, Check, X, Pencil } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import DashboardSectionPage from "@/components/shared/DashboardSectionPage";
import EventStalls from "@/components/shared/EventStalls";
import { uploadExpoBanner } from "@/api/expoService";
import {
  fetchMyEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  uploadEventImage,
  fetchBookingRequests,
  approveBooking,
  rejectBooking,
} from "@/store/slices/eventSlice";

const BASE = import.meta.env.VITE_API_URL || "";

const img = (url) => url?.startsWith("http") ? url : `${BASE}${url || ""}`;

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

const statusOrder = { pending: 0, confirmed: 1, cancelled: 2 };

const ExhibitorEvents = () => {
  const dispatch = useDispatch();
  const { events, requests, loading } = useSelector((state) => state.event);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [eventType, setEventType] = useState("");
  const [boothCapacity, setBoothCapacity] = useState("");
  const [banner, setBanner] = useState("");
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectNote, setRejectNote] = useState("");

  const field = "w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground";

  useEffect(() => {
    dispatch(fetchMyEvents());
    dispatch(fetchBookingRequests());
  }, [dispatch]);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setLocation("");
    setEventType("");
    setBoothCapacity("");
    setBanner("");
    setImages([]);
    setExistingImages([]);
    setFormOpen(false);
  };

  const handleNewEvent = () => {
    if (formOpen && !editingId) {
      resetForm();
      return;
    }

    resetForm();
    setFormOpen(true);
  };

  const uploadOne = async (file) => {
    if (!file.type.startsWith("image/")) throw new Error("Please select an image.");
    if (file.size > 10 * 1024 * 1024) throw new Error("Image size must be under 10MB.");

    const result = await uploadExpoBanner(file);

    if (!result?.image?.url) throw new Error("Image upload failed.");

    return result.image.url;
  };

  const handleBanner = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImages(true);
      setBanner(await uploadOne(file));
      toast.success("Banner uploaded");
    } catch (error) {
      toast.error(error.message || "Banner upload failed");
    } finally {
      setUploadingImages(false);
      event.target.value = "";
    }
  };

  const handleEdit = (event) => {
    setEditingId(event._id);
    setTitle(event.title ?? "");
    setDescription(event.description ?? "");
    setLocation(event.location ?? "");
    setEventType(event.eventType ?? "");
    setBoothCapacity(String(event.boothCapacity ?? ""));
    setBanner(event.banner || "");
    setExistingImages(event.images ?? []);
    setImages([]);
    setFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !eventType.trim() || !location.trim() || !boothCapacity) {
      toast.error("Please fill in all required fields");
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
        banner,
        images: imageUrls,
      };

      const result = editingId
        ? await dispatch(updateEvent({ id: editingId, data: payload }))
        : await dispatch(createEvent(payload));

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

  const pendingCount = requests.filter((r) => r.bookingStatus === "pending").length;

  return (
    <DashboardLayout role="exhibitor">
      <DashboardSectionPage
        title="Events & Bookings"
        description="Create your events and manage booking requests from attendees."
      >
        <div className="mb-6">
          <button
            type="button"
            onClick={handleNewEvent}
            className="flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-medium text-background"
          >
            <Plus size={16} /> New Event
          </button>
        </div>

        {formOpen && (
          <div className="mb-6 space-y-4 rounded-2xl border border-border bg-surface p-5">
            <h3 className="text-base font-semibold text-foreground">
              {editingId ? "Edit Event" : "Create Event"}
            </h3>

            {editingId && (
              <p className="rounded-lg border border-gold/40 bg-gold/10 p-2 text-xs text-gold">
                Saving changes may send this event back to admin approval.
              </p>
            )}

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title *"
              className={field}
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Event description *"
              rows={3}
              className={field}
            />

            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className={field}
            >
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

            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Event location *"
              className={field}
            />

            <input
              type="number"
              min="1"
              step="1"
              value={boothCapacity}
              onChange={(e) => setBoothCapacity(e.target.value)}
              placeholder="Maximum number of stalls *"
              className={field}
            />

            <div className={`${field} flex items-center gap-3`}>
              <span className="shrink-0 text-sm text-muted">Banner</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleBanner}
                disabled={uploadingImages}
                className="min-w-0 flex-1 text-sm text-foreground"
              />
            </div>

            {banner && (
              <div className="relative inline-block">
                <img
                  src={img(banner)}
                  alt="Event banner"
                  className="h-24 w-40 rounded-lg border border-border object-cover"
                />
                <button
                  type="button"
                  onClick={() => setBanner("")}
                  className="absolute -right-2 -top-2 rounded-full bg-red-500 px-1.5 text-xs text-white"
                  aria-label="Remove banner"
                >
                  ×
                </button>
              </div>
            )}

            <div className={`${field} flex items-center gap-3`}>
              <span className="shrink-0 text-sm text-muted">Images</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setImages(Array.from(e.target.files || []))}
                disabled={uploadingImages}
                className="min-w-0 flex-1 text-sm text-foreground"
              />
            </div>

            {images.length > 0 && (
              <p className="text-xs text-muted">{images.length} new image(s) selected</p>
            )}

            {!!existingImages.length && (
              <div className="flex flex-wrap gap-2">
                {existingImages.map((url) => (
                  <div key={url} className="relative">
                    <img
                      src={img(url)}
                      alt=""
                      className="h-14 w-14 rounded-lg border border-border object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setExistingImages((prev) => prev.filter((item) => item !== url))}
                      className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1 text-[10px] text-white"
                      aria-label="Remove existing image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={uploadingImages}
                className="flex-1 rounded-lg bg-gold py-2 text-sm font-medium text-background disabled:opacity-50"
              >
                {uploadingImages ? "Please wait..." : editingId ? "Save Changes" : "Submit Event"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                disabled={uploadingImages}
                className="rounded-lg border border-border px-4 py-2 text-sm text-muted"
              >
                Cancel
              </button>
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
              {event.banner && (
                <img
                  src={img(event.banner)}
                  alt={event.title}
                  className="h-28 w-full rounded-lg object-cover"
                />
              )}

              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-foreground">{event.title}</p>
                  {event.status && (
                    <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-xs ${badge[event.status] || badge.pending}`}>
                      {event.status === "approved" ? "Approved" : event.status === "rejected" ? "Rejected" : event.status}
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

              {!!event.images?.length && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {event.images.map((url, index) => (
                    <img
                      key={`${url}-${index}`}
                      src={img(url)}
                      alt={event.title}
                      className="h-16 w-16 rounded-lg border border-border object-cover"
                    />
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

        <div className="mt-10">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">Booking Requests</h2>
            {pendingCount > 0 && (
              <span className="rounded-full bg-gold px-2.5 py-0.5 text-xs font-semibold text-background">
                {pendingCount} pending
              </span>
            )}
          </div>

          {!requests.length && <p className="text-sm text-muted">No booking requests yet.</p>}

          <div className="space-y-3">
            {sortedRequests.map((r) => (
              <div key={r._id} className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground">{r.user?.name || "Attendee"}</p>
                    <p className="text-xs text-muted">
                      {r.user?.email}{r.user?.phone ? ` · ${r.user.phone}` : ""}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      Event: <span className="text-foreground">{r.event?.title || r.eventName || "Event"}</span>
                    </p>
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

                {r.bookingStatus === "confirmed" && r.passCode && (
                  <p className="mt-2 text-sm text-muted">
                    Pass: <span className="font-mono text-gold">{r.passCode}</span>
                  </p>
                )}

                {r.decisionNote && (
                  <p className="mt-2 text-sm text-red-300">Reason: {r.decisionNote}</p>
                )}

                {r.bookingStatus === "pending" && rejectingId !== r._id && (
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleApprove(r._id)}
                      className="flex items-center gap-1.5 rounded-lg bg-gold px-4 py-2 text-sm font-medium text-background"
                    >
                      <Check size={14} /> Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRejectingId(r._id);
                        setRejectNote("");
                      }}
                      className="flex items-center gap-1.5 rounded-lg border border-red-500/40 px-4 py-2 text-sm font-medium text-red-300"
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                )}

                {r.bookingStatus === "pending" && rejectingId === r._id && (
                  <div className="mt-4 space-y-2">
                    <textarea
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                      rows={2}
                      placeholder="Reason for rejection"
                      className={field}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleReject(r._id)}
                        className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white"
                      >
                        Confirm reject
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectingId(null)}
                        className="rounded-lg border border-border px-4 py-2 text-sm text-muted"
                      >
                        Cancel
                      </button>
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
