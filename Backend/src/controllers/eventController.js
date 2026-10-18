import mongoose from "mongoose";
import Event from "../models/Event.js";
import Attendee from "../models/Attendee.js";
import User from "../models/User.js";

const getMyId = (req) =>
  String(req.user?.userId ?? req.user?._id ?? req.user?.id ?? req.user?.sub ?? "");

const isActiveUser = async (userId) => {
  const user = await User.findById(userId).select("status");
  return !!user && user.status === "active";
};

const isValidPrice = (price) => Number.isFinite(price) && price >= 0;
const isValidCapacity = (capacity) => Number.isInteger(capacity) && capacity >= 1;
const eventNotFoundOrReviewed = async (res, id) => {
  const exists = await Event.exists({ _id: id });
  if (exists) {
    return res.status(409).json({ error: "Event already reviewed or not pending" });
  }
  return res.status(404).json({ error: "Event not found" });
};

const createEvent = async (req, res) => {
  try {
    const exhibitor = getMyId(req);

    if (!mongoose.isValidObjectId(exhibitor)) {
      return res.status(401).json({ error: "Please login again" });
    }
    if (!(await isActiveUser(exhibitor))) {
      return res.status(403).json({ error: "Your account is not active. Please contact the admin" });
    }

    const { title, description, eventType, images, boothCapacity, location } = req.body;
    const eventPrice = Number(req.body.price ?? 0);

    if (!isValidPrice(eventPrice)) {
      return res.status(400).json({ error: "Event price must be a valid non-negative amount" });
    }
    if (!title?.trim() || !description?.trim() || !eventType?.trim() || !boothCapacity || !location?.trim()) {
      return res.status(400).json({ error: "Title, description, event type, booth capacity and location are required" });
    }

    const parsedBoothCapacity = Number(boothCapacity);
    if (!isValidCapacity(parsedBoothCapacity)) {
      return res.status(400).json({ error: "Booth capacity must be at least 1" });
    }

    const event = await Event.create({
      exhibitor,
      title: title.trim(),
      description: description.trim(),
      eventType: eventType.trim(),
      location: location.trim(),
      images: Array.isArray(images) ? images : [],
      boothCapacity: parsedBoothCapacity,
      price: eventPrice,
      status: "pending",
    });

    await event.populate("exhibitor", "name companyName");

    return res.status(201).json({ msg: "Event submitted for admin approval", event });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getMyEvents = async (req, res) => {
  try {
    const exhibitor = getMyId(req);

    if (!mongoose.isValidObjectId(exhibitor)) {
      return res.status(401).json({ error: "Please login again" });
    }

    const events = await Event.find({ exhibitor })
      .populate("exhibitor", "name companyName")
      .sort({ createdAt: -1 });

    return res.status(200).json({ msg: "Events fetched", events });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getAllEvents = async (req, res) => {
  try {
    const filter = { status: "approved" };

    if (req.query.status && req.query.status !== "all") {
      filter.status = req.query.status;
    }

    const allEvents = await Event.find(filter)
      .populate({ path: "exhibitor", select: "name companyName", match: { status: "active" } })
      .sort({ createdAt: -1 });
    const events = allEvents.filter((e) => e.exhibitor);

    return res.status(200).json({ msg: "All approved events fetched", events });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getPendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "pending" })
      .populate("exhibitor", "name companyName email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ msg: "Pending events fetched", events });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getAdminEvents = async (req, res) => {
  try {
    const filter = {};

    if (req.query.status && req.query.status !== "all") {
      filter.status = req.query.status;
    }

    if (req.query.search?.trim()) {
      const regex = new RegExp(req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ title: regex }, { description: regex }, { eventType: regex }, { location: regex }];
    }

    const events = await Event.find(filter)
      .populate("exhibitor", "name companyName email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({ msg: "Events fetched", events });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const approveEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }

    const event = await Event.findOneAndUpdate(
      { _id: id, status: "pending" },
      { $set: { status: "approved", reviewedAt: new Date(), adminNote: "" } },
      { new: true }
    ).populate("exhibitor", "name companyName email");

    if (!event) {
      return eventNotFoundOrReviewed(res, id);
    }

    return res.status(200).json({ msg: "Event approved", event });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const rejectEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const note = req.body.note?.trim() || req.body.adminNote?.trim();

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }
    if (!note) {
      return res.status(400).json({ error: "Please add a reason for rejection" });
    }

    const event = await Event.findOneAndUpdate(
      { _id: id, status: "pending" },
      { $set: { status: "rejected", adminNote: note, rejectionReason: note, reviewedAt: new Date() } },
      { new: true }
    ).populate("exhibitor", "name companyName email");

    if (!event) {
      return eventNotFoundOrReviewed(res, id);
    }

    return res.status(200).json({ msg: "Event rejected", event });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const removeEvent = async (req, res, isAdmin) => {
  try {
    const { id } = req.params;
    const exhibitor = getMyId(req);

    if (!isAdmin && !mongoose.isValidObjectId(exhibitor)) {
      return res.status(401).json({ error: "Please login again" });
    }
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }

    const event = await Event.findOneAndDelete({ _id: id, ...(!isAdmin && { exhibitor }) });

    if (!event) {
      return res.status(404).json({ error: isAdmin ? "Event not found" : "Event not found or not yours" });
    }
    await Attendee.updateMany(
      { event: id, bookingStatus: { $ne: "cancelled" }, passStatus: { $ne: "scanned" } },
      {
        bookingStatus: "cancelled",
        registrationStatus: "cancelled",
        passStatus: "revoked",
        decisionNote: `This event was cancelled by the ${isAdmin ? "administrator" : "exhibitor"}`,
      }
    );
    await Attendee.updateMany(
      { event: id, bookingStatus: { $ne: "cancelled" }, passStatus: "scanned" },
      { bookingStatus: "cancelled", decisionNote: "This event was deleted after check-in" }
    );

    return res.status(200).json({ msg: "Event deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteEvent = (req, res) => removeEvent(req, res, false);
const deleteAdminEvent = (req, res) => removeEvent(req, res, true);

const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const exhibitor = getMyId(req);

    if (!mongoose.isValidObjectId(exhibitor)) {
      return res.status(401).json({ error: "Please login again" });
    }
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }
    if (!(await isActiveUser(exhibitor))) {
      return res.status(403).json({ error: "Your account is not active. Please contact the admin" });
    }

    const event = await Event.findOne({ _id: id, exhibitor });
    if (!event) {
      return res.status(404).json({ error: "Event not found or not yours" });
    }

    const { title, description, eventType, images, boothCapacity, location } = req.body;

    if (!title?.trim() || !description?.trim() || !eventType?.trim() || !boothCapacity || !location?.trim()) {
      return res.status(400).json({ error: "Title, description, event type, booth capacity and location are required" });
    }

    const parsedBoothCapacity = Number(boothCapacity);
    if (!isValidCapacity(parsedBoothCapacity)) {
      return res.status(400).json({ error: "Booth capacity must be at least 1" });
    }
    if (parsedBoothCapacity < (event.stalls?.length ?? 0)) {
      return res.status(400).json({ error: `Capacity cannot be less than your current stalls (${event.stalls.length})` });
    }

    event.title = title.trim();
    event.description = description.trim();
    event.eventType = eventType.trim();
    event.location = location.trim();
    event.boothCapacity = parsedBoothCapacity;

    if (req.body.price !== undefined) {
      const eventPrice = Number(req.body.price);
      if (!isValidPrice(eventPrice)) {
        return res.status(400).json({ error: "Event price must be a valid non-negative amount" });
      }
      event.price = eventPrice;
    }

    if (Array.isArray(images)) {
      event.images = images;
    }

    event.status = "pending";
    event.rejectionReason = undefined;
    event.adminNote = "";
    event.reviewedAt = undefined;

    await event.save();
    await event.populate("exhibitor", "name companyName");

    return res.status(200).json({ msg: "Event updated and sent for admin approval", event });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export { createEvent, getMyEvents, getAllEvents, getPendingEvents, getAdminEvents, approveEvent, rejectEvent, deleteEvent, deleteAdminEvent, updateEvent };