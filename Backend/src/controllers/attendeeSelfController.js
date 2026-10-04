import mongoose from "mongoose";
import Attendee from "../models/Attendee.js";
import Event from "../models/Event.js";
import User from "../models/User.js";

// protect middleware jis naam se bhi id rakhe, wahi utha lo
const getMyId = (req) => String(req.user?.userId ?? req.user?._id ?? req.user?.id ?? req.user?.sub ?? "");

const eventPopulate = {
  path: "event",
  select: "title date expo booth",
  populate: [
    { path: "expo", select: "title location" },
    { path: "booth", select: "boothNumber" },
  ],
};

const generatePassCode = async () => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = `PASS-${Math.floor(100000 + Math.random() * 900000)}`;
    if (!(await Attendee.exists({ passCode: candidate }))) return candidate;
  }
  return null;
};

// ---------- ATTENDEE ----------

// POST /book  { event }
export const bookEvent = async (req, res) => {
  try {
    const userId = getMyId(req);
    const { event } = req.body;

    if (!mongoose.isValidObjectId(userId)) return res.status(401).json({ error: "Please login again" });
    if (!event || !mongoose.isValidObjectId(event)) return res.status(400).json({ error: "Please select an event" });

    const user = await User.findById(userId).select("role status");
    if (!user || user.role !== "attendee") {
      return res.status(403).json({ error: "Only attendee accounts can book tickets" });
    }
    if (user.status !== "active") return res.status(403).json({ error: "This account is not active" });

    const eventDoc = await Event.findById(event).populate("expo", "status");
    if (!eventDoc || eventDoc.expo?.status !== "published") {
      return res.status(404).json({ error: "Event not found" });
    }
    if (eventDoc.date < new Date()) return res.status(400).json({ error: "This event has already ended" });

    if (await Attendee.exists({ user: userId, event })) {
      return res.status(409).json({ error: "You have already requested a ticket for this event" });
    }

    const attendee = await Attendee.create({
      user: userId,
      event: eventDoc._id,
      eventName: eventDoc.title,
      ticketType: "Standard Pass",
      registrationStatus: "registered",
      bookingStatus: "pending",
      passStatus: "issued",
      registrationEventKey: `event:${eventDoc._id}`,
      uniqueKeysEnforced: true,
    });
    await attendee.populate(eventPopulate);

    return res.status(201).json({ msg: "Ticket request sent", attendee });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: "You have already requested a ticket for this event" });
    res.status(500).json({ error: error.message });
  }
};

// GET /my
export const getMyRegistrations = async (req, res) => {
  try {
    const userId = getMyId(req);
    if (!mongoose.isValidObjectId(userId)) return res.status(401).json({ error: "Please login again" });

    const registrations = await Attendee.find({ user: userId })
      .populate(eventPopulate)
      .populate("expo", "title date location")
      .sort({ createdAt: -1 });

    return res.status(200).json({ registrations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ---------- EXHIBITOR (identifyUser: req.user poora user document hai) ----------

// GET /requests  (mere events ki tickets)
export const getBookingRequests = async (req, res) => {
  try {
    const events = await Event.find({ exhibitor: req.user._id }).select("_id");
    const requests = await Attendee.find({ event: { $in: events.map((e) => e._id) } })
      .populate("user", "name email phone")
      .populate("event", "title date")
      .sort({ createdAt: -1 });

    return res.status(200).json({ requests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const findOwnedBooking = async (req) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return { status: 400, error: "Invalid booking ID" };
  const booking = await Attendee.findById(id).populate("event", "exhibitor title");
  if (!booking || !booking.event) return { status: 404, error: "Booking not found" };
  if (String(booking.event.exhibitor) !== String(req.user._id)) {
    return { status: 403, error: "This ticket is not for your event" };
  }
  return { booking };
};

// PUT /requests/:id/approve
export const approveBooking = async (req, res) => {
  try {
    const found = await findOwnedBooking(req);
    if (found.error) return res.status(found.status).json({ error: found.error });
    const { booking } = found;

    if (booking.bookingStatus === "confirmed") return res.status(409).json({ error: "Ticket is already approved" });

    if (!booking.passCode) {
      const code = await generatePassCode();
      if (!code) return res.status(503).json({ error: "Could not generate a pass code. Please try again" });
      booking.passCode = code;
    }
    booking.bookingStatus = "confirmed";
    booking.registrationStatus = "confirmed";
    booking.passStatus = "issued";
    booking.decisionNote = "";
    await booking.save();
    await booking.populate("user", "name email phone");

    return res.status(200).json({ msg: "Ticket approved", booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /requests/:id/reject  { note }
export const rejectBooking = async (req, res) => {
  try {
    const note = req.body.note?.trim();
    if (!note) return res.status(400).json({ error: "Please add a reason for rejection" });

    const found = await findOwnedBooking(req);
    if (found.error) return res.status(found.status).json({ error: found.error });
    const { booking } = found;

    booking.bookingStatus = "cancelled";
    booking.registrationStatus = "cancelled";
    booking.passStatus = "revoked";
    booking.decisionNote = note;
    await booking.save();
    await booking.populate("user", "name email phone");

    return res.status(200).json({ msg: "Ticket rejected", booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};