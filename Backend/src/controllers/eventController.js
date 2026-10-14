import mongoose from "mongoose";
import Event from "../models/Event.js";
import Attendee from "../models/Attendee.js";
import User from "../models/User.js";
import Expo from "../models/Expo.js";
import Booth from "../models/Booth.js";

const getMyId = (req) =>
  String(req.user?.userId ?? req.user?._id ?? req.user?.id ?? req.user?.sub ?? "");

const createEvent = async (req, res) => {
  try {
    const exhibitor = getMyId(req);

    if (!mongoose.isValidObjectId(exhibitor)) {
      return res.status(401).json({ error: "Please login again" });
    }

    const user = await User.findById(exhibitor).select("status");

    if (!user || user.status !== "active") {
      return res.status(403).json({
        error: "Your account is not active. Please contact the admin",
      });
    }

    const { title, description, date, eventType, images, boothCapacity, banner, location, expo } = req.body;

    if (
      !title?.trim() ||
      !description?.trim() ||
      !eventType?.trim() ||
      !boothCapacity ||
      (!expo && !location?.trim()) ||
      (expo && !date)
    ) {
      return res.status(400).json({
        error: "Title, description, event type, booth capacity and either location or an expo with date are required",
      });
    }

    let expoDoc = null;
    let parsedDate;

    if (expo) {
      if (!mongoose.isValidObjectId(expo)) {
        return res.status(400).json({ error: "Invalid expo" });
      }

      expoDoc = await Expo.findById(expo);
      if (!expoDoc) {
        return res.status(404).json({ error: "Expo not found" });
      }

      if (expoDoc.status !== "published") {
        return res.status(400).json({ error: "You can only add events to a published expo" });
      }

      const hasBooth = await Booth.findOne({
        exhibitor,
        expo,
        status: { $in: ["reserved", "occupied"] },
      });
      if (!hasBooth) {
        return res.status(403).json({
          error: "You need a reserved booth on this expo before creating an event",
        });
      }
    }

    if (date) {
      parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ error: "Invalid date" });
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (parsedDate < today) {
        return res.status(400).json({ error: "Event date must be today or in the future" });
      }
    }

    const parsedBoothCapacity = Number(boothCapacity);

    if (!Number.isInteger(parsedBoothCapacity) || parsedBoothCapacity < 1) {
      return res.status(400).json({ error: "Booth capacity must be at least 1" });
    }

    const event = await Event.create({
      ...(expoDoc && { expo: expoDoc._id }),
      exhibitor,
      title: title.trim(),
      description: description.trim(),
      eventType: eventType.trim(),
      location: expoDoc?.location ?? location.trim(),
      ...(parsedDate && { date: parsedDate }),
      images: Array.isArray(images) ? images : [],
      boothCapacity: parsedBoothCapacity,
      banner,
      status: "pending",
    });

    if (expoDoc) await event.populate("expo", "title date location status");
    await event.populate("exhibitor", "name companyName");

    return res.status(201).json({
      msg: "Event submitted for admin approval",
      event,
    });
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

    const events = await Event.find(filter)
      .populate("exhibitor", "name companyName")
      .sort({ createdAt: -1 });

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
      const regex = new RegExp(
        req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );

      filter.$or = [
        { title: regex },
        { description: regex },
        { eventType: regex },
        { location: regex },
      ];
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
      const exists = await Event.exists({ _id: id });

      return exists
        ? res.status(409).json({ error: "Event already reviewed or not pending" })
        : res.status(404).json({ error: "Event not found" });
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
      {
        $set: {
          status: "rejected",
          adminNote: note,
          rejectionReason: note,
          reviewedAt: new Date(),
        },
      },
      { new: true }
    ).populate("exhibitor", "name companyName email");

    if (!event) {
      const exists = await Event.exists({ _id: id });

      return exists
        ? res.status(409).json({ error: "Event already reviewed or not pending" })
        : res.status(404).json({ error: "Event not found" });
    }

    return res.status(200).json({ msg: "Event rejected", event });
  } catch (error) {
    return res.status(500).json({ error: error.message });
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

    await Attendee.updateMany(
      { event: id, bookingStatus: { $ne: "cancelled" } },
      {
        bookingStatus: "cancelled",
        registrationStatus: "cancelled",
        passStatus: "revoked",
        decisionNote: "This event was cancelled by the exhibitor",
      }
    );

    return res.status(200).json({ msg: "Event deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
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
      return res.status(403).json({
        error: "Your account is not active. Please contact the admin",
      });
    }

    const event = await Event.findOne({ _id: id, exhibitor });

    if (!event) {
      return res.status(404).json({ error: "Event not found or not yours" });
    }

    const { title, description, eventType, images, boothCapacity, location, date, banner } = req.body;

    if (
      !title?.trim() ||
      !description?.trim() ||
      !eventType?.trim() ||
      !boothCapacity ||
      !location?.trim()
    ) {
      return res.status(400).json({
        error: "Title, description, event type, booth capacity and location are required",
      });
    }

    const parsedBoothCapacity = Number(boothCapacity);

    if (!Number.isInteger(parsedBoothCapacity) || parsedBoothCapacity < 1) {
      return res.status(400).json({ error: "Booth capacity must be at least 1" });
    }

    if (parsedBoothCapacity < (event.stalls?.length ?? 0)) {
      return res.status(400).json({
        error: `Capacity cannot be less than your current stalls (${event.stalls.length})`,
      });
    }

    event.title = title.trim();
    event.description = description.trim();
    event.eventType = eventType.trim();
    event.location = location.trim();
    event.boothCapacity = parsedBoothCapacity;

    if (banner !== undefined) event.banner = banner;

    if (date !== undefined) {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ error: "Invalid date" });
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (parsedDate < today) {
        return res.status(400).json({ error: "Event date must be today or in the future" });
      }
      event.date = parsedDate;
    }
    if (Array.isArray(images)) event.images = images;

    event.status = "pending";
    event.rejectionReason = undefined;
    event.adminNote = "";
    event.reviewedAt = undefined;

    await event.save();
    await event.populate("exhibitor", "name companyName");

    return res.status(200).json({
      msg: "Event updated and sent for admin approval",
      event,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export {
  createEvent,
  getMyEvents,
  getAllEvents,
  getPendingEvents,
  getAdminEvents,
  approveEvent,
  rejectEvent,
  deleteEvent,
  updateEvent,
};