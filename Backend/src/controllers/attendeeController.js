import mongoose from "mongoose";
import Attendee from "../models/Attendee.js";
import User from "../models/User.js";

const VALID_REGISTRATION_STATUSES = ["registered", "confirmed", "attended", "cancelled"];
const VALID_BOOKING_STATUSES = ["confirmed", "pending", "cancelled"];
const VALID_PASS_STATUSES = ["issued", "claimed", "scanned", "revoked"];
const eventKey = (expoId, name) => expoId
  ? `expo:${expoId}`
  : name?.trim() && name.trim() !== "General Platform Event"
    ? `name:${name.trim().toLowerCase()}`
    : undefined;
const isDuplicateKeyError = (error) => error?.code === 11000;
const duplicateResponse = (res, error) => res.status(409).json({
  error: error?.keyPattern?.passCode || error?.keyValue?.passCode
    ? "This pass code is already in use."
    : "This user is already registered for this event.",
});

// GET /api/attendees
export const getAllAttendees = async (req, res) => {
  try {
    const { search, registrationStatus, bookingStatus, passStatus, expo } = req.query;

    const attendeeUserIds = await User.find({ role: "attendee" }).distinct("_id");
    const filter = { user: { $in: attendeeUserIds } };

    // Registration status filter
    if (registrationStatus && registrationStatus !== "all") {
      if (VALID_REGISTRATION_STATUSES.includes(registrationStatus)) {
        filter.registrationStatus = registrationStatus;
      }
    }

    // Booking status filter
    if (bookingStatus && bookingStatus !== "all") {
      if (VALID_BOOKING_STATUSES.includes(bookingStatus)) {
        filter.bookingStatus = bookingStatus;
      }
    }

    // Pass status filter
    if (passStatus && passStatus !== "all") {
      if (VALID_PASS_STATUSES.includes(passStatus)) {
        filter.passStatus = passStatus;
      }
    }

    // Expo filter if provided
    if (expo && mongoose.Types.ObjectId.isValid(expo)) {
      filter.expo = expo;
    }

    // Search across attendee name, email, phone, passCode, and eventName
    if (search && search.trim() !== "") {
      const cleanSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(cleanSearch, "i");

      // Find user IDs whose name, email, or phone match
      const matchingUsers = await User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
        ],
      }).select("_id");

      const userIds = matchingUsers.map((u) => u._id);

      filter.$or = [
        { user: { $in: userIds } },
        { passCode: searchRegex },
        { eventName: searchRegex },
        { ticketType: searchRegex },
      ];
    }

    const attendees = await Attendee.find(filter)
      .populate("user", "name email phone role companyName")
      .populate("expo", "title date location status")
      .sort({ createdAt: -1 });

    const total = attendees.length;

    res.status(200).json({
      success: true,
      total,
      attendees,
    });
  } catch (error) {
    console.error("Error fetching attendees:", error);
    res.status(500).json({ error: error.message || "Failed to fetch attendees" });
  }
};

// GET /api/attendees/:id
export const getAttendeeById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid attendee ID format" });
    }

    const attendee = await Attendee.findOne({ _id: id, user: { $in: await User.find({ role: "attendee" }).distinct("_id") } })
      .populate("user", "name email phone role companyName")
      .populate("expo", "title date location status");

    if (!attendee) {
      return res.status(404).json({ error: "Attendee record not found" });
    }

    res.status(200).json({ success: true, attendee });
  } catch (error) {
    console.error("Error fetching attendee details:", error);
    res.status(500).json({ error: error.message || "Failed to fetch attendee details" });
  }
};

// POST /api/attendees
export const createAttendee = async (req, res) => {
  try {
    const {
      user: userId,
      expo: expoId,
      eventName,
      registrationStatus = "registered",
      bookingStatus = "confirmed",
      passStatus = "issued",
      ticketType = "Standard Pass",
      passCode,
      notes,
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User association is required." });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user identifier format." });
    }

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ error: "Selected user does not exist in the database." });
    }
    if (existingUser.role !== "attendee") {
      return res.status(403).json({ error: "Attendee records can only be associated with users whose role is attendee." });
    }

    if (expoId && !mongoose.Types.ObjectId.isValid(expoId)) {
      return res.status(400).json({ error: "Invalid event identifier format." });
    }

    // Check enum validity
    if (registrationStatus && !VALID_REGISTRATION_STATUSES.includes(registrationStatus)) {
      return res.status(400).json({
        error: `Invalid registration status. Must be one of: ${VALID_REGISTRATION_STATUSES.join(", ")}`,
      });
    }

    if (bookingStatus && !VALID_BOOKING_STATUSES.includes(bookingStatus)) {
      return res.status(400).json({
        error: `Invalid booking status. Must be one of: ${VALID_BOOKING_STATUSES.join(", ")}`,
      });
    }

    if (passStatus && !VALID_PASS_STATUSES.includes(passStatus)) {
      return res.status(400).json({
        error: `Invalid pass status. Must be one of: ${VALID_PASS_STATUSES.join(", ")}`,
      });
    }

    // Check duplicate attendee registration if expo or eventName is provided
    if (expoId && mongoose.Types.ObjectId.isValid(expoId)) {
      const duplicate = await Attendee.findOne({ user: userId, expo: expoId });
      if (duplicate) {
        return res.status(409).json({
          error: "This user is already registered for this event.",
        });
      }
    } else if (eventName && eventName.trim() !== "" && eventName.trim() !== "General Platform Event") {
      const duplicate = await Attendee.findOne({
        user: userId,
        eventName: eventName.trim(),
      });
      if (duplicate) {
        return res.status(409).json({
          error: `This user is already registered for "${eventName.trim()}".`,
        });
      }
    }

    // Auto-generate passCode if none provided
    let finalPassCode = passCode?.trim() ? passCode.trim().toUpperCase() : "";
    if (!finalPassCode) {
      for (let attempt = 0; attempt < 10; attempt += 1) {
        const candidate = `PASS-${Math.floor(100000 + Math.random() * 900000)}`;
        if (!(await Attendee.exists({ passCode: candidate }))) {
          finalPassCode = candidate;
          break;
        }
      }
      if (!finalPassCode) return res.status(503).json({ error: "Unable to generate a unique pass code. Please try again." });
    } else if (await Attendee.exists({ passCode: finalPassCode })) {
      return res.status(409).json({ error: "This pass code is already in use." });
    }

    const newAttendee = await Attendee.create({
      user: userId,
      expo: expoId || undefined,
      eventName: eventName ? eventName.trim() : undefined,
      registrationStatus: registrationStatus || "registered",
      bookingStatus: bookingStatus || "confirmed",
      passStatus: passStatus || "issued",
      ticketType: ticketType ? ticketType.trim() : "Standard Pass",
      passCode: finalPassCode,
      registrationEventKey: eventKey(expoId, eventName),
      uniqueKeysEnforced: true,
      notes: notes ? notes.trim() : undefined,
    });

    const populated = await Attendee.findById(newAttendee._id)
      .populate("user", "name email phone role companyName")
      .populate("expo", "title date location status");

    res.status(201).json({
      success: true,
      msg: "Attendee registered successfully.",
      attendee: populated,
    });
  } catch (error) {
    console.error("Error creating attendee:", error);
    if (isDuplicateKeyError(error)) return duplicateResponse(res, error);
    res.status(500).json({ error: error.message || "Failed to create attendee" });
  }
};

// PUT /api/attendees/:id
export const updateAttendee = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      user: userId,
      registrationStatus,
      bookingStatus,
      passStatus,
      ticketType,
      passCode,
      eventName,
      expo,
      notes,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid attendee ID format." });
    }

    const attendee = await Attendee.findById(id);
    if (!attendee) {
      return res.status(404).json({ error: "Attendee record not found." });
    }

    const nextUserId = userId || attendee.user;
    if (userId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ error: "Invalid user identifier format." });
      const nextUser = await User.findById(userId);
      if (!nextUser) return res.status(404).json({ error: "Selected user does not exist in the database." });
      if (nextUser.role !== "attendee") return res.status(403).json({ error: "Attendee records can only be associated with users whose role is attendee." });
      attendee.user = userId;
    }

    if (registrationStatus) {
      if (!VALID_REGISTRATION_STATUSES.includes(registrationStatus)) {
        return res.status(400).json({
          error: `Invalid registration status. Must be one of: ${VALID_REGISTRATION_STATUSES.join(", ")}`,
        });
      }
      attendee.registrationStatus = registrationStatus;
    }

    if (bookingStatus) {
      if (!VALID_BOOKING_STATUSES.includes(bookingStatus)) {
        return res.status(400).json({
          error: `Invalid booking status. Must be one of: ${VALID_BOOKING_STATUSES.join(", ")}`,
        });
      }
      attendee.bookingStatus = bookingStatus;
    }

    if (passStatus) {
      if (!VALID_PASS_STATUSES.includes(passStatus)) {
        return res.status(400).json({
          error: `Invalid pass status. Must be one of: ${VALID_PASS_STATUSES.join(", ")}`,
        });
      }
      attendee.passStatus = passStatus;
    }

    if (ticketType !== undefined) attendee.ticketType = ticketType.trim();
    if (passCode !== undefined) attendee.passCode = passCode.trim().toUpperCase();
    if (eventName !== undefined) attendee.eventName = eventName.trim();
    if (notes !== undefined) attendee.notes = notes.trim();

    if (expo !== undefined) {
      if (expo && !mongoose.Types.ObjectId.isValid(expo)) {
        return res.status(400).json({ error: "Invalid event ID format." });
      }
      attendee.expo = expo || undefined;
    }

    const nextExpo = expo !== undefined ? expo : attendee.expo;
    const nextEventName = eventName !== undefined ? eventName : attendee.eventName;
    const nextKey = eventKey(nextExpo, nextEventName);
    if (nextKey) {
      const duplicateFilter = nextExpo ? { user: nextUserId, expo: nextExpo } :
        nextEventName && nextEventName !== "General Platform Event"
          ? { user: nextUserId, eventName: nextEventName.trim() }
          : { user: nextUserId, registrationEventKey: nextKey };
      const duplicate = await Attendee.exists({ _id: { $ne: id }, ...duplicateFilter });
      if (duplicate) return res.status(409).json({ error: "This user is already registered for this event." });
    }
    if (passCode !== undefined && passCode.trim() && await Attendee.exists({ _id: { $ne: id }, passCode: passCode.trim().toUpperCase() })) {
      return res.status(409).json({ error: "This pass code is already in use." });
    }
    attendee.registrationEventKey = nextKey;
    attendee.uniqueKeysEnforced = true;

    await attendee.save();

    const populated = await Attendee.findById(id)
      .populate("user", "name email phone role companyName")
      .populate("expo", "title date location status");

    res.status(200).json({
      success: true,
      msg: "Attendee updated successfully.",
      attendee: populated,
    });
  } catch (error) {
    console.error("Error updating attendee:", error);
    if (isDuplicateKeyError(error)) return duplicateResponse(res, error);
    res.status(500).json({ error: error.message || "Failed to update attendee" });
  }
};

// DELETE /api/attendees/:id
export const deleteAttendee = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid attendee ID format." });
    }

    const attendee = await Attendee.findByIdAndDelete(id);
    if (!attendee) {
      return res.status(404).json({ error: "Attendee record not found." });
    }

    res.status(200).json({
      success: true,
      msg: "Attendee record removed successfully.",
    });
  } catch (error) {
    console.error("Error deleting attendee:", error);
    res.status(500).json({ error: error.message || "Failed to delete attendee" });
  }
};

// GET /api/attendees/stats
export const getAttendeeStats = async (req, res) => {
  try {
    const attendeeUserIds = await User.find({ role: "attendee" }).distinct("_id");
    const scope = { user: { $in: attendeeUserIds } };
    const [
      total,
      pendingRegistrations,
      confirmedRegistrations,
      attendedRegistrations,
      confirmedBookings,
      pendingBookings,
      issuedPasses,
      claimedPasses,
      scannedPasses,
      generatedPasses,
    ] = await Promise.all([
      Attendee.countDocuments(scope),
      Attendee.countDocuments({ ...scope, registrationStatus: "registered" }),
      Attendee.countDocuments({ ...scope, registrationStatus: "confirmed" }),
      Attendee.countDocuments({ ...scope, registrationStatus: "attended" }),
      Attendee.countDocuments({ ...scope, bookingStatus: "confirmed" }),
      Attendee.countDocuments({ ...scope, bookingStatus: "pending" }),
      Attendee.countDocuments({ ...scope, passStatus: "issued", passCode: { $exists: true, $ne: "" } }),
      Attendee.countDocuments({ ...scope, passStatus: "claimed", passCode: { $exists: true, $ne: "" } }),
      Attendee.countDocuments({ ...scope, passStatus: "scanned", passCode: { $exists: true, $ne: "" } }),
      Attendee.countDocuments({ ...scope, passCode: { $exists: true, $ne: "" } }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total,
        pendingRegistrations,
        confirmedRegistrations,
        attendedRegistrations,
        confirmedBookings,
        pendingBookings,
        issuedPasses,
        generatedPasses,
        claimedPasses,
        scannedPasses,
      },
    });
  } catch (error) {
    console.error("Error fetching attendee statistics:", error);
    res.status(500).json({ error: error.message || "Failed to fetch attendee statistics" });
  }
};
