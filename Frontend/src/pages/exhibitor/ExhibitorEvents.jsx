import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Plus, Trash2, Check, X, Pencil } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import DashboardSectionPage from "@/components/shared/DashboardSectionPage";
<<<<<<< HEAD
import { fetchMyEvents, createEvent, updateEvent, deleteEvent, fetchBookingRequests, approveBooking, rejectBooking, uploadEventImage } from "@/store/slices/eventSlice";
=======
import {
  fetchMyEvents,
  createEvent,
  deleteEvent,
  fetchBookingRequests,
  approveBooking,
  rejectBooking,
} from "@/store/slices/eventSlice";
import { uploadExpoBanner } from "@/api/expoService";
import api from "@/api/api";
>>>>>>> 0935a6b (updated admin tickets, controllers)

const BASE = import.meta.env.VITE_API_URL || "";
const img = (u) => (u?.startsWith("http") ? u : `${BASE}${u || ""}`);

const badge = {
  pending: "bg-gold/20 text-gold border border-gold/40",
  confirmed: "bg-emerald/20 text-emerald-300 border border-emerald/40",
  cancelled: "bg-red-500/20 text-red-300 border border-red-500/30",
  approved: "bg-emerald/20 text-emerald-300 border border-emerald/40",
  rejected: "bg-red-500/20 text-red-300 border border-red-500/30",
};

const ExhibitorEvents = () => {
  const dispatch = useDispatch();
<<<<<<< HEAD
  const { events, requests, loading } = useSelector((state) => state.event);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
=======
  const { events, requests, loading } = useSelector((s) => s.event);

  const [open, setOpen] = useState(false);
>>>>>>> 0935a6b (updated admin tickets, controllers)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [eventType, setEventType] = useState("");
  const [boothCapacity, setBoothCapacity] = useState("");
  const [expoId, setExpoId] = useState("");
  const [banner, setBanner] = useState("");
  const [images, setImages] = useState([]);
<<<<<<< HEAD
  const [existingImages, setExistingImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
=======
  const [expos, setExpos] = useState([]);
  const [busy, setBusy] = useState(false);
>>>>>>> 0935a6b (updated admin tickets, controllers)
  const [rejectingId, setRejectingId] = useState(null);
  const [note, setNote] = useState("");

  const field =
    "w-full rounded-lg border border-border bg-background p-2 text-sm text-foreground";

  useEffect(() => {
    dispatch(fetchMyEvents());
    dispatch(fetchBookingRequests());
    api
      .get("/api/booth/mine")
      .then(({ data }) => {
        const list = data.booths || (data.booth ? [data.booth] : []);
        const map = new Map();
        list.forEach((b) => {
          if (!b.expo) return;
          const id = String(b.expo._id || b.expo);
          if (!map.has(id))
            map.set(id, { _id: id, title: b.expo.title || "Expo", boothNumber: b.boothNumber });
        });
        setExpos([...map.values()]);
      })
      .catch(console.error);
  }, [dispatch]);

<<<<<<< HEAD
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
=======
  const clear = () => {
    setTitle("");
    setDescription("");
    setDate("");
    setEventType("");
    setBoothCapacity("");
    setExpoId("");
    setBanner("");
    setImages([]);
    setOpen(false);
  };
>>>>>>> 0935a6b (updated admin tickets, controllers)

  const uploadOne = async (file) => {
    if (!file.type.startsWith("image/")) throw new Error("Invalid image");
    if (file.size > 5 * 1024 * 1024) throw new Error("Max 5MB");
    const res = await uploadExpoBanner(file);
    if (!res?.image?.url) throw new Error("Upload failed");
    return res.image.url;
  };

  const onBanner = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
<<<<<<< HEAD
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
=======
      setBusy(true);
      setBanner(await uploadOne(file));
      toast.success("Banner uploaded");
    } catch (err) {
      toast.error(err.message || "Upload failed");
>>>>>>> 0935a6b (updated admin tickets, controllers)
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

<<<<<<< HEAD
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
=======
  const onImages = async (e) => {
    const files = [...(e.target.files || [])];
    if (!files.length) return;
    try {
      setBusy(true);
      const urls = [];
      for (const f of files) {
        try {
          urls.push(await uploadOne(f));
        } catch (err) {
          toast.error(err.message);
        }
      }
      if (urls.length) {
        setImages((p) => [...p, ...urls]);
        toast.success(`${urls.length} image(s) added`);
      }
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  const onCreate = async () => {
    if (!title.trim() || !description.trim() || !date || !eventType.trim() || !boothCapacity || !expoId) {
      toast.error("Fill all required fields");
      return;
    }
    setBusy(true);
    const result = await dispatch(
      createEvent({
        title: title.trim(),
        description: description.trim(),
        date,
        eventType: eventType.trim(),
        boothCapacity: Number(boothCapacity),
        expo: expoId,
        banner: banner || undefined,
        images,
      })
    );
    setBusy(false);
    if (createEvent.fulfilled.match(result)) {
      toast.success(result.payload?.msg || "Submitted for approval");
      clear();
      dispatch(fetchMyEvents());
    } else {
      toast.error(result.payload?.error || "Could not create event");
>>>>>>> 0935a6b (updated admin tickets, controllers)
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    const r = await dispatch(deleteEvent(id));
    toast[deleteEvent.fulfilled.match(r) ? "success" : "error"](
      deleteEvent.fulfilled.match(r) ? "Deleted" : r.payload?.error || "Failed"
    );
  };

<<<<<<< HEAD
  const removeExistingImage = (url) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
  };

  const sortedRequests = [...requests].sort((a, b) => statusOrder[a.bookingStatus] - statusOrder[b.bookingStatus]);
  const pendingCount = requests.filter((r) => r.bookingStatus === "pending").length;
=======
  const onApprove = async (id) => {
    const r = await dispatch(approveBooking(id));
    toast[approveBooking.fulfilled.match(r) ? "success" : "error"](
      approveBooking.fulfilled.match(r) ? "Approved" : r.payload?.error || "Failed"
    );
  };

  const onReject = async (id) => {
    if (!note.trim()) return toast.error("Add a reason");
    const r = await dispatch(rejectBooking({ id, note: note.trim() }));
    if (rejectBooking.fulfilled.match(r)) {
      toast.success("Rejected");
      setRejectingId(null);
      setNote("");
    } else toast.error(r.payload?.error || "Failed");
  };

  const pending = requests.filter((r) => r.bookingStatus === "pending").length;
>>>>>>> 0935a6b (updated admin tickets, controllers)

  return (
    <DashboardLayout role="exhibitor">
      <DashboardSectionPage
<<<<<<< HEAD
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
=======
        title="Events & Tickets"
        description="Create events for your booth and manage ticket requests."
      >
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="mb-6 flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-medium text-background"
        >
          <Plus size={16} /> New Event
        </button>

                {open && (
          <div className="mb-6 space-y-3 rounded-2xl border border-border bg-surface p-5">
            <select value={expoId} onChange={(e) => setExpoId(e.target.value)} className={field}>
              <option value="">Select Expo *</option>
              {expos.map((x) => (
                <option key={x._id} value={x._id}>
                  {x.title}{x.boothNumber ? ` (Booth ${x.boothNumber})` : ""}
                </option>
              ))}
            </select>
            {!expos.length && (
              <p className="text-xs text-red-300">Reserve a booth on a published expo first.</p>
            )}
>>>>>>> 0935a6b (updated admin tickets, controllers)

            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title *" className={field} />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description *" rows={3} className={field} />
            <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className={field} />

            <select value={eventType} onChange={(e) => setEventType(e.target.value)} className={field}>
              <option value="">Select type *</option>
              <option value="Workshop">Workshop</option>
              <option value="Demo">Demo</option>
              <option value="Talk">Talk</option>
              <option value="Product Launch">Product Launch</option>
              <option value="Networking">Networking</option>
              <option value="Other">Other</option>
            </select>

<<<<<<< HEAD
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
=======
            <input type="number" min={1} value={boothCapacity} onChange={(e) => setBoothCapacity(e.target.value)} placeholder="Capacity *" className={field} />

            <div className={field + " flex items-center gap-3"}>
              <span className="shrink-0 text-sm text-muted">Banner</span>
              <input type="file" accept="image/*" onChange={onBanner} disabled={busy} className="min-w-0 flex-1 text-sm text-foreground file:mr-2 file:rounded file:border-0 file:bg-gold/20 file:px-2 file:py-1 file:text-xs file:text-gold" />
>>>>>>> 0935a6b (updated admin tickets, controllers)
            </div>
            {banner && (
              <div className="relative inline-block">
                <img src={img(banner)} alt="" className="h-24 w-40 rounded-lg border border-border object-cover" />
                <button type="button" onClick={() => setBanner("")} className="absolute -right-2 -top-2 rounded-full bg-red-500 px-1.5 text-xs text-white">×</button>
              </div>
            )}

<<<<<<< HEAD
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
=======
            <div className={field + " flex items-center gap-3"}>
              <span className="shrink-0 text-sm text-muted">Images</span>
              <input type="file" accept="image/*" multiple onChange={onImages} disabled={busy} className="min-w-0 flex-1 text-sm text-foreground file:mr-2 file:rounded file:border-0 file:bg-gold/20 file:px-2 file:py-1 file:text-xs file:text-gold" />
            </div>
            {!!images.length && (
              <div className="flex flex-wrap gap-2">
                {images.map((u) => (
                  <div key={u} className="relative">
                    <img src={img(u)} alt="" className="h-14 w-14 rounded-lg border border-border object-cover" />
                    <button type="button" onClick={() => setImages((p) => p.filter((x) => x !== u))} className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1 text-[10px] text-white">×</button>
                  </div>
                ))}
              </div>
            )}

            <button type="button" onClick={onCreate} disabled={busy} className="w-full rounded-lg bg-gold py-2 text-sm font-medium text-background disabled:opacity-60">
              {busy ? "Please wait…" : "Create Event"}
            </button>
>>>>>>> 0935a6b (updated admin tickets, controllers)
          </div>
        )}

        {loading && <p className="text-sm text-muted">Loading...</p>}
        {!loading && !events.length && (
          <p className="text-sm text-muted">No events yet. Need a reserved booth to create one.</p>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {events.map((ev) => (
            <div key={ev._id} className="space-y-2 rounded-2xl border border-border bg-surface p-4">
              {ev.banner && <img src={img(ev.banner)} alt="" className="h-28 w-full rounded-lg object-cover" />}
              <div className="flex justify-between gap-2">
                <div>
                  <p className="font-semibold text-foreground">{ev.title}</p>
                  {ev.expo?.title && <p className="text-xs text-muted">Expo: {ev.expo.title}</p>}
                </div>
<<<<<<< HEAD

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
=======
                <button type="button" onClick={() => onDelete(ev._id)}>
                  <Trash2 size={14} className="text-muted hover:text-red-400" />
                </button>
              </div>
              <p className="text-sm text-muted">{ev.description}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono text-gold">{new Date(ev.date).toLocaleString()}</span>
                {ev.status && (
                  <span className={`rounded-full border px-2 py-0.5 ${badge[ev.status] || badge.pending}`}>
                    {ev.status}
                  </span>
                )}
                {ev.eventType && <span className="text-muted">{ev.eventType}</span>}
              </div>
>>>>>>> 0935a6b (updated admin tickets, controllers)
            </div>
          ))}
        </div>

<<<<<<< HEAD
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

=======
        <div className="mt-10">
          <h3 className="mb-3 text-lg font-semibold text-foreground">
            Ticket Requests{pending ? ` (${pending} pending)` : ""}
          </h3>
          {!requests.length && <p className="text-sm text-muted">No ticket requests yet.</p>}
>>>>>>> 0935a6b (updated admin tickets, controllers)
          <div className="space-y-3">
            {requests.map((r) => (
              <div key={r._id} className="rounded-2xl border border-border bg-surface p-4">
<<<<<<< HEAD
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
=======
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">
                      {r.user?.name || "Attendee"} · {r.user?.email}
                    </p>
                    <p className="text-xs text-muted">
                      {r.event?.title || r.eventName || "Event"} · {new Date(r.createdAt).toLocaleDateString()}
                    </p>
>>>>>>> 0935a6b (updated admin tickets, controllers)
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs ${badge[r.bookingStatus] || badge.pending}`}>
                    {r.bookingStatus}
                  </span>
                </div>

<<<<<<< HEAD
=======
                {r.bookingStatus === "confirmed" && r.passCode && (
                  <p className="mt-2 text-sm text-muted">
                    Pass: <span className="font-mono text-gold">{r.passCode}</span>
                  </p>
                )}
>>>>>>> 0935a6b (updated admin tickets, controllers)
                {r.bookingStatus === "cancelled" && r.decisionNote && (
                  <p className="mt-2 text-sm text-red-300">Reason: {r.decisionNote}</p>
                )}

                {r.bookingStatus === "pending" && rejectingId !== r._id && (
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => onApprove(r._id)} className="flex items-center gap-1 rounded-lg bg-gold px-3 py-1.5 text-sm text-background">
                      <Check size={14} /> Approve
                    </button>
                    <button type="button" onClick={() => { setRejectingId(r._id); setNote(""); }} className="flex items-center gap-1 rounded-lg border border-red-500/40 px-3 py-1.5 text-sm text-red-300">
                      <X size={14} /> Reject
                    </button>
                  </div>
                )}

                {r.bookingStatus === "pending" && rejectingId === r._id && (
                  <div className="mt-3 space-y-2">
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Rejection reason" className={field} />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => onReject(r._id)} className="rounded-lg bg-red-500 px-3 py-1.5 text-sm text-white">Confirm</button>
                      <button type="button" onClick={() => setRejectingId(null)} className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted">Cancel</button>
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