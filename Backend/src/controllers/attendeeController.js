import mongoose from "mongoose";
import Attendee from "../models/Attendee.js";
import User from "../models/User.js";
import { generatePassCode } from "../utils/passCode.js";

const DEFAULT_EVENT = "General Platform Event";

const statusOptions = {
  registrationStatus: ["registered", "confirmed", "attended", "cancelled"],
  bookingStatus: ["confirmed", "pending", "cancelled"],
  passStatus: ["pending", "issued", "claimed", "scanned", "revoked"],
};

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
const nameKey = (name) => (name && name !== DEFAULT_EVENT ? `name:${name.toLowerCase()}` : undefined);
const getAttendeeUserIds = () => User.find({ role: "attendee" }).distinct("_id");

const populateRefs = (query) =>
  query
    .populate("user", "name email phone role companyName")
    .populate("expo", "title date location status")
    .populate("event", "title date location");

const findWrongStatus = (body) =>
  Object.keys(statusOptions).find((field) => body[field] && !statusOptions[field].includes(body[field]));

const handleError = (res, error, fallbackMsg) => {
  console.error(fallbackMsg, error);
  if (error?.code === 11000) {
    const passClash = error.keyPattern?.passCode || error.keyPattern?.entryPassId;
    return res.status(409).json({
      error: passClash ? "This pass code is already in use." : "This user is already registered for this event.",
    });
  }
  res.status(500).json({ error: error.message || fallbackMsg });
};

export const getAllAttendees = async (req, res) => {
  try {
    const { search, expo } = req.query;
    const filter = { user: { $in: await getAttendeeUserIds() } };

    for (const field of Object.keys(statusOptions)) {
      if (statusOptions[field].includes(req.query[field])) filter[field] = req.query[field];
    }
    if (isValidId(expo)) filter.expo = expo;

    if (search?.trim()) {
      const text = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      const matchingUsers = await User.find({
        $or: [{ name: text }, { email: text }, { phone: text }],
      }).select("_id");

      filter.$or = [
        { user: { $in: matchingUsers.map((u) => u._id) } },
        { passCode: text },
        { entryPassId: text },
        { eventName: text },
        { ticketType: text },
      ];
    }

    const attendees = await populateRefs(Attendee.find(filter)).sort({ createdAt: -1 });
    res.status(200).json({ success: true, total: attendees.length, attendees });
  } catch (error) {
    handleError(res, error, "Failed to fetch attendees");
  }
};

export const createAttendee = async (req, res) => {
  try {
    const { user, ticketType, passCode, notes, registrationStatus, passStatus, bookingStatus } = req.body;
    const eventName = req.body.eventName?.trim() || undefined;

    if (!user || !isValidId(user)) {
      return res.status(400).json({ error: "A valid user is required." });
    }
    const owner = await User.findById(user).select("role");
    if (!owner) {
      return res.status(404).json({ error: "Selected user does not exist in the database." });
    }
    if (owner.role !== "attendee") {
      return res.status(403).json({ error: "Attendee records can only be associated with users whose role is attendee." });
    }

    const wrongField = findWrongStatus(req.body);
    if (wrongField) {
      return res.status(400).json({
        error: `Invalid ${wrongField}. Must be one of: ${statusOptions[wrongField].join(", ")}`,
      });
    }
    if (passStatus === "scanned" || registrationStatus === "attended") {
      return res.status(400).json({ error: "Check-in status is set only by scanning the pass QR code." });
    }

    const key = nameKey(eventName);
    if (key && (await Attendee.exists({ user, eventName }))) {
      return res.status(409).json({ error: `This user is already registered for "${eventName}".` });
    }

    let code = passCode?.trim().toUpperCase();
    if (code) {
      if (await Attendee.exists({ $or: [{ passCode: code }, { entryPassId: code }] })) {
        return res.status(409).json({ error: "This pass code is already in use." });
      }
    } else {
      code = await generatePassCode();
      if (!code) {
        return res.status(503).json({ error: "Unable to generate a unique pass code. Please try again." });
      }
    }

    const created = await Attendee.create({
      user,
      eventName,
      registrationStatus,
      bookingStatus,
      passStatus,
      ticketType: ticketType?.trim() || "Standard Pass",
      passCode: code,
      entryPassId: code,
      registrationEventKey: key,
      uniqueKeysEnforced: true,
      notes: notes?.trim() || undefined,
    });

    const attendee = await populateRefs(Attendee.findById(created._id));
    res.status(201).json({ success: true, msg: "Attendee registered successfully.", attendee });
  } catch (error) {
    handleError(res, error, "Failed to create attendee");
  }
};

export const updateAttendee = async (req, res) => {
  try {
    const { id } = req.params;
    const { registrationStatus, bookingStatus, passStatus, ticketType, passCode, eventName, notes } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({ error: "Invalid attendee ID format." });
    }
    const attendee = await Attendee.findById(id);
    if (!attendee) {
      return res.status(404).json({ error: "Attendee record not found." });
    }

    const wrongField = findWrongStatus(req.body);
    if (wrongField) {
      return res.status(400).json({
        error: `Invalid ${wrongField}. Must be one of: ${statusOptions[wrongField].join(", ")}`,
      });
    }

    const alreadyScanned = attendee.passStatus === "scanned";
    const checkingIn = passStatus === "scanned" && !alreadyScanned;

    if (
      alreadyScanned &&
      ((bookingStatus && bookingStatus !== attendee.bookingStatus) ||
        (registrationStatus && registrationStatus !== attendee.registrationStatus) ||
        (passStatus && passStatus !== "scanned"))
    ) {
      return res.status(409).json({ error: "A checked-in pass cannot be reset." });
    }
    if (registrationStatus === "attended" && attendee.registrationStatus !== "attended" && !checkingIn) {
      return res.status(400).json({ error: "Check-in status is set only by scanning the pass QR code." });
    }
    if (checkingIn) {
      const canCheckIn =
        ["issued", "claimed"].includes(attendee.passStatus) &&
        (bookingStatus || attendee.bookingStatus) === "confirmed" &&
        (attendee.passCode || attendee.entryPassId);
      if (!canCheckIn) {
        return res.status(409).json({ error: "Only a confirmed pass with a pass code can be checked in." });
      }
    }

    if (registrationStatus) attendee.registrationStatus = registrationStatus;
    if (bookingStatus) attendee.bookingStatus = bookingStatus;
    if (passStatus) attendee.passStatus = passStatus;
    if (checkingIn) {
      attendee.registrationStatus = "attended";
      attendee.checkedInAt = new Date();
    }

    if (ticketType !== undefined) attendee.ticketType = ticketType.trim();
    if (notes !== undefined) attendee.notes = notes.trim();

    if (passCode !== undefined) {
      const code = passCode.trim().toUpperCase();
      const used = code && (await Attendee.exists({ _id: { $ne: id }, $or: [{ passCode: code }, { entryPassId: code }] }));
      if (used) {
        return res.status(409).json({ error: "This pass code is already in use." });
      }
      attendee.passCode = code;
      attendee.entryPassId = code;
    }

    if (eventName !== undefined) {
      attendee.eventName = eventName.trim();
      if (!attendee.expo) {
        const key = nameKey(attendee.eventName);
        if (key && (await Attendee.exists({ _id: { $ne: id }, user: attendee.user, eventName: attendee.eventName }))) {
          return res.status(409).json({ error: "This user is already registered for this event." });
        }
        attendee.registrationEventKey = key;
      }
    }

    attendee.uniqueKeysEnforced = true;
    await attendee.save();

    const updated = await populateRefs(Attendee.findById(id));
    res.status(200).json({ success: true, msg: "Attendee updated successfully.", attendee: updated });
  } catch (error) {
    handleError(res, error, "Failed to update attendee");
  }
};

export const deleteAttendee = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ error: "Invalid attendee ID format." });
    }

    const removed = await Attendee.findByIdAndDelete(id);
    if (!removed) {
      return res.status(404).json({ error: "Attendee record not found." });
    }
    res.status(200).json({ success: true, msg: "Attendee record removed successfully." });
  } catch (error) {
    handleError(res, error, "Failed to delete attendee");
  }
};

export const getAttendeeStats = async (req, res) => {
  try {
    const scope = { user: { $in: await getAttendeeUserIds() } };
    const [total, pendingRegistrations, confirmedBookings, scannedPasses] = await Promise.all([
      Attendee.countDocuments(scope),
      Attendee.countDocuments({ ...scope, registrationStatus: "registered" }),
      Attendee.countDocuments({ ...scope, bookingStatus: "confirmed" }),
      Attendee.countDocuments({ ...scope, passStatus: "scanned", passCode: { $exists: true, $ne: "" } }),
    ]);

    res.status(200).json({
      success: true,
      stats: { total, pendingRegistrations, confirmedBookings, scannedPasses },
    });
  } catch (error) {
    handleError(res, error, "Failed to fetch attendee statistics");
  }
};