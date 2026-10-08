import mongoose from "mongoose";
import Event from "../models/Event.js";
import Attendee from "../models/Attendee.js";
import User from "../models/User.js";

// protect middleware jis naam se bhi id rakhe, wahi utha lo

const getMyId = (req) => String(req.user?.userId ?? req.user?._id ?? req.user?.id ?? req.user?.sub ?? "");

const createEvent = async (req, res) => {
  try {
    const exhibitor = getMyId(req);

    if (!mongoose.isValidObjectId(exhibitor)) {
      return res.status(401).json({ error: "Please login again" });
    }

    const user = await User.findById(exhibitor).select("status");

    if (!user || user.status !== "active") {
      return res.status(403).json({ error: "Your account is not active. Please contact the admin" });
    }

    const { title, description, eventType, images, boothCapacity, banner, location } = req.body;

    if (!title?.trim() || !description?.trim() || !eventType?.trim() || !location?.trim() || !boothCapacity) {
      return res.status(400).json({ error: "Title, description, event type, location and booth capacity are required" });
    }

    const parsedBoothCapacity = Number(boothCapacity);

    if (!Number.isInteger(parsedBoothCapacity) || parsedBoothCapacity < 1) {
      return res.status(400).json({ error: "Booth capacity must be at least 1" });
    }

    const event = await Event.create({
      exhibitor,
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      eventType: eventType.trim(),
      images: Array.isArray(images) ? images : [],
      boothCapacity: parsedBoothCapacity,
      banner,
      status: "pending"
    });

    return res.status(201).json({ msg: "Event submitted for admin approval", event });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
};

// public: sirf admin approved events

const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "approved" })
      .populate("exhibitor", "name companyName")
      .sort({ createdAt: -1 });

    return res.status(200).json({ msg: "All approved events fetched", events });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const exhibitor = getMyId(req);

    if (!mongoose.isValidObjectId(exhibitor)) {
      return res.status(401).json({ error: "Please login again" });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }

    const event = await Event.findOneAndDelete({ _id: id, exhibitor });

    if (!event) {
      return res.status(404).json({ error: "Event not found or not yours" });
    }

    // is event ki tickets khud cancel ho jayen

    await Attendee.updateMany(
      { event: id, bookingStatus: { $ne: "cancelled" } },
      { bookingStatus: "cancelled", registrationStatus: "cancelled", passStatus: "revoked", decisionNote: "This event was cancelled by the exhibitor" }
    );

    return res.status(200).json({ msg: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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

    const user = await User.findById(exhibitor).select("status");

    if (!user || user.status !== "active") {
      return res.status(403).json({ error: "Your account is not active. Please contact the admin" });
    }

    const event = await Event.findOne({ _id: id, exhibitor });

    if (!event) {
      return res.status(404).json({ error: "Event not found or not yours" });
    }

    const { title, description, eventType, images, boothCapacity, location } = req.body;

    if (!title?.trim() || !description?.trim() || !eventType?.trim() || !location?.trim() || !boothCapacity) {
      return res.status(400).json({ error: "Title, description, event type, location and booth capacity are required" });
    }

    const parsedBoothCapacity = Number(boothCapacity);

    if (!Number.isInteger(parsedBoothCapacity) || parsedBoothCapacity < 1) {
      return res.status(400).json({ error: "Booth capacity must be at least 1" });
    }

    event.title = title.trim();
    event.description = description.trim();
    event.location = location.trim();
    event.eventType = eventType.trim();
    event.boothCapacity = parsedBoothCapacity;
    if (Array.isArray(images)) event.images = images;

    // edit ke baad dobara admin approval chahiye
    event.status = "pending";
    event.rejectionReason = undefined;
    event.reviewedAt = undefined;

    await event.save();

    return res.status(200).json({ msg: "Event updated and sent for admin approval", event });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { createEvent, getMyEvents, getAllEvents, deleteEvent, updateEvent };