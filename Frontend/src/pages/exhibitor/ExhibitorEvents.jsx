import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Plus, Trash2, Check, X, Pencil } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import DashboardSectionPage from "@/components/shared/DashboardSectionPage";
import { fetchMyEvents, createEvent, updateEvent, deleteEvent, fetchBookingRequests, approveBooking, rejectBooking, uploadEventImage } from "@/store/slices/eventSlice";

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
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [eventType, setEventType] = useState("");
  const [boothCapacity, setBoothCapacity] = useState("");
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectNote, setRejectNote] = useState("");

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
    setImages([]);
    setExistingImages([]);
    setFormOpen(false);
  };

  const handleNewEvent = () => {
    if(formOpen && !editingId){
      resetForm();
      return;
    }
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
    setExistingImages(event.images ?? []);
    setImages([]);
    setFormOpen(true);
    window.scrollTo({top: 0, behavior: "smooth"});
  };

  const handleSubmit = async () => {
    if(!title.trim() || !description.trim() || !eventType.trim() || !location.trim() || !boothCapacity){
      toast.error("Please fill in all fields");
      return;
    }

    if(Number(boothCapacity) < 1 || !Number.isInteger(Number(boothCapacity))){
      toast.error("Booth capacity must be a whole number of at least 1");
      return;
    }

    try {
      setUploadingImages(true);

      const imageUrls = [...existingImages];

      for(const file of images){
        const uploaded = await dispatch(uploadEventImage(file)).unwrap();
        imageUrls.push(uploaded.image.url);
      }

      const payload = {
        title,
        description,
        eventType,
        location,
        boothCapacity: Number(boothCapacity),
        images: imageUrls,
      };

      const result = editingId
        ? await dispatch(updateEvent({id: editingId, data: payload}))
        : await dispatch(createEvent(payload));

      const action = editingId ? updateEvent : createEvent;

      if(action.fulfilled.match(result)){
        toast.success(editingId ? "Event updated and sent for admin approval" : "Event submitted for admin approval");
        resetForm();
        dispatch(fetchMyEvents());
      } else {
        toast.error(result.payload?.error || result.payload?.msg || (editingId ? "Could not update event" : "Could not create event"));
      }
    } catch (error) {
      toast.error(error?.error || error?.msg || "Could not upload event images");
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDelete = async (eventId) => {
    if(!window.confirm("Delete this event? Its booking requests will be cancelled.")) return;
    const result = await dispatch(deleteEvent(eventId));
    if(deleteEvent.fulfilled.match(result)){
      toast.success("Event deleted");
      if(editingId === eventId) resetForm();
    } else {
      toast.error(result.payload?.error || "Could not delete event");
    }
  };

  const handleApprove = async (id) => {
    const result = await dispatch(approveBooking(id));
    if(approveBooking.fulfilled.match(result)){
      toast.success("Booking approved");
    } else {
      toast.error(result.payload?.error || "Could not approve booking");
    }
  };

  const handleReject = async (id) => {
    if(!rejectNote.trim()){
      toast.error("Please add a reason for rejection");
      return;
    }

    const result = await dispatch(rejectBooking({id, note: rejectNote.trim()}));
    if(rejectBooking.fulfilled.match(result)){
      toast.success("Booking rejected");
      setRejectingId(null);
      setRejectNote("");
    } else {
      toast.error(result.payload?.error || "Could not reject booking");
    }
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
  };

  const removeExistingImage = (url) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
  };

  const sortedRequests = [...requests].sort((a, b) => statusOrder[a.bookingStatus] - statusOrder[b.bookingStatus]);
  const pendingCount = requests.filter((r) => r.bookingStatus === "pending").length;

  return (
    <DashboardLayout role="exhibitor">
      <DashboardSectionPage
        title="Events & Bookings"
        description="Create events and approve booking requests from attendees."
      >
        <div className="mb-6">
          <button onClick={handleNewEvent} className="flex items-center gap-2 rounded-lg bg-gold text-background px-4 py-2 text-sm font-medium">
            <Plus size={16} /> New Event
          </button>
        </div>

        {formOpen && (
          <div className="mb-6 rounded-2xl border border-border bg-surface p-6 space-y-4">
            <h3 className="text-base font-semibold text-foreground">
              {editingId ? "Edit Event" : "Create Event"}
            </h3>

            {editingId && (
              <p className="rounded-lg border border-gold/40 bg-gold/10 p-2 text-xs text-gold">
                Saving changes will send this event back to the admin for approval, and it will stay hidden from the website until approved.
              </p>
            )}

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Event description"
              rows={3}
              className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground"
            />

            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground"
            >
              <option value="">Select event type</option>
              <option value="Wedding">Wedding</option>
              <option value="Birthday">Birthday</option>
              <option value="Corporate">Corporate</option>
              <option value="Exhibition">Exhibition</option>
              <option value="Festival">Festival</option>
              <option value="Conference">Conference</option>
              <option value="Other">Other</option>
            </select>

            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Event location (e.g. Expo Centre, Karachi)"
              className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground"
            />

            <input
              type="number"
              min="1"
              step="1"
              value={boothCapacity}
              onChange={(e) => setBoothCapacity(e.target.value)}
              placeholder="Maximum number of stalls / booths"
              className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground"
            />

            <p className="text-xs text-muted">The event date is chosen by the attendee when booking.</p>

            <div>
              <label className="mb-2 block text-sm text-muted">Event images</label>

              {existingImages.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {existingImages.map((image) => (
                    <div key={image} className="relative">
                      <img src={image} alt="" className="h-16 w-16 rounded-lg object-cover border border-border" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(image)}
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"
                        aria-label="Remove image"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImages}
                className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground"
              />
              {images.length > 0 && (
                <p className="mt-2 text-xs text-muted">{images.length} new image(s) selected</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={uploadingImages}
                className="flex-1 rounded-lg bg-gold text-background py-2 text-sm font-medium disabled:opacity-50"
              >
                {uploadingImages ? "Saving..." : editingId ? "Save Changes" : "Submit Event"}
              </button>

              {editingId && (
                <button
                  onClick={resetForm}
                  disabled={uploadingImages}
                  className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:text-foreground disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
            </div>
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
                <div>
                  <p className="font-semibold text-foreground">{event.title}</p>
                  {event.status && (
                    <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${event.status === "pending" ? "bg-gold/20 text-gold border border-gold/40" : event.status === "approved" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-red-500/20 text-red-300 border border-red-500/30"}`}>
                      {event.status === "pending" ? "Pending Approval" : event.status === "approved" ? "Approved" : "Rejected"}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={() => handleEdit(event)} aria-label="Edit event">
                    <Pencil size={14} className="text-muted hover:text-gold" />
                  </button>

                  <button onClick={() => handleDelete(event._id)} aria-label="Delete event">
                    <Trash2 size={14} className="text-muted hover:text-red-400" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-muted">{event.description}</p>

              <p className="text-xs text-gold">
                Type: <span className="text-foreground">{event.eventType}</span>
              </p>

              <p className="text-xs text-gold">
                Location: <span className="text-foreground">{event.location || "Not set"}</span>
              </p>

              <p className="text-xs text-gold">
                Stall capacity: <span className="text-foreground">{event.boothCapacity}</span>
              </p>

              {event.images?.length > 0 && (
                <div className="flex gap-2 pt-2">
                  {event.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={event.title}
                      className="h-16 w-16 rounded-lg object-cover border border-border"
                    />
                  ))}
                </div>
              )}

              {event.status === "rejected" && event.rejectionReason && (
                <p className="text-xs text-red-300">
                  Rejection reason: {event.rejectionReason}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Booking requests */}
        <div className="mt-10">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">Booking Requests</h2>
            {pendingCount > 0 && (
              <span className="rounded-full bg-gold px-2.5 py-0.5 text-xs font-semibold text-background">{pendingCount} pending</span>
            )}
          </div>

          {requests.length === 0 && (
            <p className="text-sm text-muted">No booking requests yet.</p>
          )}

          <div className="space-y-3">
            {sortedRequests.map((r) => (
              <div key={r._id} className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-foreground">{r.user?.name ?? "Attendee"}</p>
                    <p className="text-xs text-muted">{r.user?.email}{r.user?.phone ? ` · ${r.user.phone}` : ""}</p>
                    <p className="mt-1 text-sm text-muted">
                      Event: <span className="text-foreground">{r.event?.title ?? r.eventName}</span>
                    </p>
                    <p className="text-xs text-muted">Requested {new Date(r.createdAt).toLocaleDateString()}</p>

                    {r.eventDate && (
                      <p className="text-xs text-muted">Event date: <span className="text-foreground">{new Date(r.eventDate).toLocaleDateString()}</span></p>
                    )}
                    {r.guests && (
                      <p className="text-xs text-muted">Guests: <span className="text-foreground">{r.guests}</span></p>
                    )}
                    {r.contactPhone && (
                      <p className="text-xs text-muted">Contact: <span className="text-foreground">{r.contactPhone}</span></p>
                    )}
                    {r.notes && (
                      <p className="text-xs text-muted">Note: <span className="text-foreground">{r.notes}</span></p>
                    )}
                  </div>

                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[r.bookingStatus]}`}>
                    {statusLabels[r.bookingStatus] ?? r.bookingStatus}
                  </span>
                </div>

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
                    <textarea
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                      rows={2}
                      placeholder="Reason for rejection (the attendee will see this)"
                      className="w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground"
                    />

                    <div className="flex gap-2">
                      <button onClick={() => handleReject(r._id)} className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white">
                        Confirm reject
                      </button>

                      <button onClick={() => setRejectingId(null)} className="rounded-lg border border-border px-4 py-2 text-sm text-muted hover:text-foreground">
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