import mongoose from "mongoose";
import Event from "../models/Event.js";
import Attendee from "../models/Attendee.js";

// protect middleware jis naam se bhi id rakhe, wahi utha lo

const getMyId = (req) => String(req.user?.userId ?? req.user?._id ?? req.user?.id ?? req.user?.sub ?? "");

const createEvent = async (req, res) => {
  try {
    const exhibitor = getMyId(req);

    if (!mongoose.isValidObjectId(exhibitor)) {
      return res.status(401).json({ error: "Please login again" });
    }

    const { title, description, date, eventType, images, boothCapacity, banner } = req.body;

    if (!title?.trim() || !description?.trim() || !date || !eventType?.trim() || !boothCapacity) {
      return res.status(400).json({ error: "Title, description, date, event type and booth capacity are required" });
    }

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: "Invalid date" });
    }

    if (parsedDate < new Date()) {
      return res.status(400).json({ error: "Event date must be in the future" });
    }

    const parsedBoothCapacity = Number(boothCapacity);

    if (!Number.isInteger(parsedBoothCapacity) || parsedBoothCapacity < 1) {
      return res.status(400).json({ error: "Booth capacity must be at least 1" });
    }

    const event = await Event.create({
      exhibitor,
      title: title.trim(),
      description: description.trim(),
      date: parsedDate,
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
      .sort({ date: 1 });

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
      .sort({ date: 1 });

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

export { createEvent, getMyEvents, getAllEvents, deleteEvent };