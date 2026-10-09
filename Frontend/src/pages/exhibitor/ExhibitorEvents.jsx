import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { Plus, Trash2, Check, X, Pencil } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import DashboardSectionPage from "@/components/shared/DashboardSectionPage";
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
import { uploadExpoBanner } from "@/api/expoService";
import api from "@/api/api";

const BASE = import.meta.env.VITE_API_URL || "";
const img = (url) => (url?.startsWith("http") ? url : `${BASE}${url || ""}`);

const badge = {
  pending: "bg-gold/20 text-gold border border-gold/40",
  confirmed: "bg-emerald/20 text-emerald-300 border border-emerald/40",
  cancelled: "bg-red-500/20 text-red-300 border border-red-500/30",
  approved: "bg-emerald/20 text-emerald-300 border border-emerald/40",
  rejected: "bg-red-500/20 text-red-300 border border-red-500/30",
};

const ExhibitorEvents = () => {
  const dispatch = useDispatch();
  const { events, requests, loading } = useSelector((state) => state.event);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [eventType, setEventType] = useState("");
  const [boothCapacity, setBoothCapacity] = useState("");
  const [expoId, setExpoId] = useState("");
  const [banner, setBanner] = useState("");
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [expos, setExpos] = useState([]);
  const [busy, setBusy] = useState(false);
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
        list.forEach((booth) => {
          if (!booth.expo) return;
          const id = String(booth.expo._id || booth.expo);
          if (!map.has(id)) {
            map.set(id, {
              _id: id,
              title: booth.expo.title || "Expo",
              boothNumber: booth.boothNumber,
            });
          }
        });
        setExpos([...map.values()]);
      })
      .catch((error) => {
        console.error("Failed to load exhibitor expos:", error);
        toast.error(error.response?.data?.error || "Could not load your reserved expos.");
      });
  }, [dispatch]);

  const clear = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setDate("");
    setEventType("");
    setBoothCapacity("");
    setExpoId("");
    setBanner("");
    setImages([]);
    setExistingImages([]);
    setOpen(false);
  };

  const uploadOne = async (file) => {
    if (!file.type.startsWith("image/")) throw new Error("Invalid image");
    if (file.size > 5 * 1024 * 1024) throw new Error("Max 5MB");
    const result = await uploadExpoBanner(file);
    if (!result?.image?.url) throw new Error("Upload failed");
    return result.image.url;
  };

  const onBanner = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setBusy(true);
      setBanner(await uploadOne(file));
      toast.success("Banner uploaded");
    } catch (error) {
      toast.error(error.message || "Upload failed");
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  };

  const onImages = async (event) => {
    const files = [...(event.target.files || [])];
    if (!files.length) return;
    try {
      setBusy(true);
      const urls = [];
      for (const file of files) {
        try {
          const result = await dispatch(uploadEventImage(file)).unwrap();
          if (!result?.image?.url) throw new Error("Upload failed");
          urls.push(result.image.url);
        } catch (error) {
          toast.error(error.message);
        }
      }
      if (urls.length) {
        setImages((previous) => [...previous, ...urls]);
        toast.success(`${urls.length} image(s) added`);
      }
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  };

  const onEdit = (event) => {
    setEditingId(event._id);
    setTitle(event.title || "");
    setDescription(event.description || "");
    setDate(event.date ? new Date(event.date).toISOString().slice(0, 16) : "");
    setEventType(event.eventType || "");
    setBoothCapacity(String(event.boothCapacity || ""));
    setExpoId(String(event.expo?._id || event.expo || ""));
    setBanner(event.banner || "");
    setExistingImages(event.images || []);
    setImages([]);
    setOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onCreate = async () => {
    if (
      !title.trim() ||
      !description.trim() ||
      !date ||
      !eventType.trim() ||
      !boothCapacity ||
      !expoId
    ) {
      toast.error("Fill all required fields");
      return;
    }
    setBusy(true);
    const payload = {
      title: title.trim(),
      description: description.trim(),
      date,
      eventType: eventType.trim(),
      boothCapacity: Number(boothCapacity),
      expo: expoId,
      banner,
      images: [...existingImages, ...images],
    };
    const result = editingId
      ? await dispatch(updateEvent({ id: editingId, data: payload }))
      : await dispatch(createEvent(payload));
    setBusy(false);
    if (
      (editingId && updateEvent.fulfilled.match(result)) ||
      (!editingId && createEvent.fulfilled.match(result))
    ) {
      toast.success(
        result.payload?.msg ||
          (editingId ? "Event updated and submitted for approval" : "Submitted for approval")
      );
      clear();
      dispatch(fetchMyEvents());
    } else {
      toast.error(result.payload?.error || "Could not create event");
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    const result = await dispatch(deleteEvent(id));
    if (deleteEvent.fulfilled.match(result) && editingId === id) clear();
    toast[deleteEvent.fulfilled.match(result) ? "success" : "error"](
      deleteEvent.fulfilled.match(result) ? "Deleted" : result.payload?.error || "Failed"
    );
  };

  const onApprove = async (id) => {
    const result = await dispatch(approveBooking(id));
    toast[approveBooking.fulfilled.match(result) ? "success" : "error"](
      approveBooking.fulfilled.match(result)
        ? "Approved"
        : result.payload?.error || "Failed"
    );
  };

  const onReject = async (id) => {
    if (!note.trim()) return toast.error("Add a reason");
    const result = await dispatch(rejectBooking({ id, note: note.trim() }));
    if (rejectBooking.fulfilled.match(result)) {
      toast.success("Rejected");
      setRejectingId(null);
      setNote("");
    } else {
      toast.error(result.payload?.error || "Failed");
    }
  };

  const pending = requests.filter((request) => request.bookingStatus === "pending").length;

  return (
    <DashboardLayout role="exhibitor">
      <DashboardSectionPage
        title="Events & Tickets"
        description="Create events for your booth and manage ticket requests."
      >
        <button
          type="button"
          onClick={() => {
            clear();
            setOpen(true);
          }}
          className="mb-6 flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-medium text-background"
        >
          <Plus size={16} /> New Event
        </button>

        {open && (
          <div className="mb-6 space-y-3 rounded-2xl border border-border bg-surface p-5">
            <h3 className="text-base font-semibold text-foreground">
              {editingId ? "Edit Event" : "Create Event"}
            </h3>
            <select
              value={expoId}
              onChange={(event) => setExpoId(event.target.value)}
              disabled={editingId !== null}
              className={field}
            >
              <option value="">Select Expo *</option>
              {expos.map((expo) => (
                <option key={expo._id} value={expo._id}>
                  {expo.title}
                  {expo.boothNumber ? ` (Booth ${expo.boothNumber})` : ""}
                </option>
              ))}
            </select>
            {!expos.length && (
              <p className="text-xs text-red-300">
                Reserve a booth on a published expo first.
              </p>
            )}

            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Title *"
              className={field}
            />
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Description *"
              rows={3}
              className={field}
            />
            <input
              type="datetime-local"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={field}
            />

            <select
              value={eventType}
              onChange={(event) => setEventType(event.target.value)}
              className={field}
            >
              <option value="">Select type *</option>
              <option value="Workshop">Workshop</option>
              <option value="Demo">Demo</option>
              <option value="Talk">Talk</option>
              <option value="Product Launch">Product Launch</option>
              <option value="Networking">Networking</option>
              <option value="Other">Other</option>
            </select>

            <input
              type="number"
              min={1}
              value={boothCapacity}
              onChange={(event) => setBoothCapacity(event.target.value)}
              placeholder="Capacity *"
              className={field}
            />

            <div className={`${field} flex items-center gap-3`}>
              <span className="shrink-0 text-sm text-muted">Banner</span>
              <input
                type="file"
                accept="image/*"
                onChange={onBanner}
                disabled={busy}
                className="min-w-0 flex-1 text-sm text-foreground file:mr-2 file:rounded file:border-0 file:bg-gold/20 file:px-2 file:py-1 file:text-xs file:text-gold"
              />
            </div>
            {banner && (
              <div className="relative inline-block">
                <img
                  src={img(banner)}
                  alt=""
                  className="h-24 w-40 rounded-lg border border-border object-cover"
                />
                <button
                  type="button"
                  onClick={() => setBanner("")}
                  className="absolute -right-2 -top-2 rounded-full bg-red-500 px-1.5 text-xs text-white"
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
                onChange={onImages}
                disabled={busy}
                className="min-w-0 flex-1 text-sm text-foreground file:mr-2 file:rounded file:border-0 file:bg-gold/20 file:px-2 file:py-1 file:text-xs file:text-gold"
              />
            </div>
            {!!images.length && (
              <div className="flex flex-wrap gap-2">
                {images.map((url) => (
                  <div key={url} className="relative">
                    <img
                      src={img(url)}
                      alt=""
                      className="h-14 w-14 rounded-lg border border-border object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setImages((previous) => previous.filter((item) => item !== url))}
                      className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1 text-[10px] text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
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
                      onClick={() =>
                        setExistingImages((previous) =>
                          previous.filter((item) => item !== url)
                        )
                      }
                      className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1 text-[10px] text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={onCreate}
              disabled={busy}
              className="w-full rounded-lg bg-gold py-2 text-sm font-medium text-background disabled:opacity-60"
            >
              {busy ? "Please wait…" : editingId ? "Save Changes" : "Create Event"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={clear}
                disabled={busy}
                className="w-full rounded-lg border border-border py-2 text-sm text-muted"
              >
                Cancel
              </button>
            )}
          </div>
        )}

        {loading && <p className="text-sm text-muted">Loading...</p>}
        {!loading && !events.length && (
          <p className="text-sm text-muted">No events yet. Need a reserved booth to create one.</p>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {events.map((event) => (
            <div
              key={event._id}
              className="space-y-2 rounded-2xl border border-border bg-surface p-4"
            >
              {event.banner && (
                <img src={img(event.banner)} alt="" className="h-28 w-full rounded-lg object-cover" />
              )}
              <div className="flex justify-between gap-2">
                <div>
                  <p className="font-semibold text-foreground">{event.title}</p>
                  {event.expo?.title && (
                    <p className="text-xs text-muted">Expo: {event.expo.title}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => onEdit(event)} aria-label="Edit event">
                    <Pencil size={14} className="text-muted hover:text-gold" />
                  </button>
                  <button type="button" onClick={() => onDelete(event._id)} aria-label="Delete event">
                    <Trash2 size={14} className="text-muted hover:text-red-400" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-muted">{event.description}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono text-gold">
                  {new Date(event.date).toLocaleString()}
                </span>
                {event.status && (
                  <span
                    className={`rounded-full border px-2 py-0.5 ${badge[event.status] || badge.pending}`}
                  >
                    {event.status}
                  </span>
                )}
                {event.eventType && <span className="text-muted">{event.eventType}</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <h3 className="mb-3 text-lg font-semibold text-foreground">
            Ticket Requests{pending ? ` (${pending} pending)` : ""}
          </h3>
          {!requests.length && <p className="text-sm text-muted">No ticket requests yet.</p>}
          <div className="space-y-3">
            {requests.map((request) => (
              <div key={request._id} className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-foreground">
                      {request.user?.name || "Attendee"} · {request.user?.email}
                    </p>
                    <p className="text-xs text-muted">
                      {request.event?.title || request.eventName || "Event"} ·{" "}
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs ${badge[request.bookingStatus] || badge.pending}`}
                  >
                    {request.bookingStatus}
                  </span>
                </div>

                {request.bookingStatus === "confirmed" && request.passCode && (
                  <p className="mt-2 text-sm text-muted">
                    Pass: <span className="font-mono text-gold">{request.passCode}</span>
                  </p>
                )}
                {request.bookingStatus === "cancelled" && request.decisionNote && (
                  <p className="mt-2 text-sm text-red-300">
                    Reason: {request.decisionNote}
                  </p>
                )}

                {request.bookingStatus === "pending" && rejectingId !== request._id && (
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => onApprove(request._id)}
                      className="flex items-center gap-1 rounded-lg bg-gold px-3 py-1.5 text-sm text-background"
                    >
                      <Check size={14} /> Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setRejectingId(request._id);
                        setNote("");
                      }}
                      className="flex items-center gap-1 rounded-lg border border-red-500/40 px-3 py-1.5 text-sm text-red-300"
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                )}

                {request.bookingStatus === "pending" && rejectingId === request._id && (
                  <div className="mt-3 space-y-2">
                    <textarea
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      rows={2}
                      placeholder="Rejection reason"
                      className={field}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onReject(request._id)}
                        className="rounded-lg bg-red-500 px-3 py-1.5 text-sm text-white"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectingId(null)}
                        className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted"
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
