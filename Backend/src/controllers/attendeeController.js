import mongoose from "mongoose";
import Attendee from "../models/Attendee.js";
import User from "../models/User.js";

const VALID_REGISTRATION_STATUSES = ["registered", "confirmed", "attended", "cancelled"];
const VALID_BOOKING_STATUSES = ["confirmed", "pending", "cancelled"];
const VALID_PASS_STATUSES = ["issued", "claimed", "scanned", "revoked"];

// GET /api/attendees
export const getAllAttendees = async (req, res) => {
  try {
    const { search, registrationStatus, bookingStatus, passStatus, expo } = req.query;

    const filter = {};

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

    const attendee = await Attendee.findById(id)
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
      const duplicate = await Attendee.findOne({ user: userId, eventName: eventName.trim() });
      if (duplicate) {
        return res.status(409).json({
          error: `This user is already registered for "${eventName.trim()}".`,
        });
      }
    }

    // Auto-generate passCode if none provided
    const finalPassCode =
      passCode && passCode.trim() !== ""
        ? passCode.trim().toUpperCase()
        : `PASS-${Math.floor(100000 + Math.random() * 900000)}`;

    const newAttendee = await Attendee.create({
      user: userId,
      expo: expoId || undefined,
      eventName: eventName ? eventName.trim() : undefined,
      registrationStatus: registrationStatus || "registered",
      bookingStatus: bookingStatus || "confirmed",
      passStatus: passStatus || "issued",
      ticketType: ticketType ? ticketType.trim() : "Standard Pass",
      passCode: finalPassCode,
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
    res.status(500).json({ error: error.message || "Failed to create attendee" });
  }
};

// PUT /api/attendees/:id
export const updateAttendee = async (req, res) => {
  try {
    const { id } = req.params;
    const {
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
    ] = await Promise.all([
      Attendee.countDocuments(),
      Attendee.countDocuments({ registrationStatus: "registered" }),
      Attendee.countDocuments({ registrationStatus: "confirmed" }),
      Attendee.countDocuments({ registrationStatus: "attended" }),
      Attendee.countDocuments({ bookingStatus: "confirmed" }),
      Attendee.countDocuments({ bookingStatus: "pending" }),
      Attendee.countDocuments({ passStatus: "issued" }),
      Attendee.countDocuments({ passStatus: "claimed" }),
      Attendee.countDocuments({ passStatus: "scanned" }),
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
        claimedPasses,
        scannedPasses,
      },
    });
  } catch (error) {
    console.error("Error fetching attendee statistics:", error);
    res.status(500).json({ error: error.message || "Failed to fetch attendee statistics" });
  }
};
