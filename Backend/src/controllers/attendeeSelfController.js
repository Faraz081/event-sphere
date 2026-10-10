import mongoose from "mongoose";
import Attendee from "../models/Attendee.js";
import Event from "../models/Event.js";
import User from "../models/User.js";
import Expo from "../models/Expo.js";

// protect middleware jis naam se bhi id rakhe, wahi utha lo
const getMyId = (req) => String(req.user?.userId ?? req.user?._id ?? req.user?.id ?? req.user?.sub ?? "");

const eventPopulate = {
  path: "event",
  select: "title location eventType images",
};

// date ko UTC din ki range mein badlo ("2026-10-20" -> 00:00Z se agle din 00:00Z)
const toDayRange = (date) => {
  const start = new Date(`${new Date(date).toISOString().slice(0, 10)}T00:00:00.000Z`);
  return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
};

// is event pe us din koi CONFIRMED booking pehle se hai?
const isDateBooked = async (eventId, date, excludeId) => {
  const { start, end } = toDayRange(date);
  const query = { event: eventId, bookingStatus: "confirmed", eventDate: { $gte: start, $lt: end } };
  if (excludeId) query._id = { $ne: excludeId };
  return !!(await Attendee.exists(query));
};

// ---------- ATTENDEE ----------

// POST /book
// { event, eventDate, guests, phone, message, stalls: [stallId] }
export const bookEvent = async (req, res) => {
  try {
    const userId = getMyId(req);
        const { event, eventDate, guests, phone, message, stalls, name } = req.body;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(401).json({ error: "Please login again" });
    }

    if (!event || !mongoose.isValidObjectId(event)) {
      return res.status(400).json({ error: "Please select an event" });
    }

    const user = await User.findById(userId).select("role status");

    if (!user || user.role !== "attendee") {
      return res.status(403).json({ error: "Only attendee accounts can book events" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ error: "This account is not active" });
    }

        const contactName = name?.trim();

    if (!contactName) {
      return res.status(400).json({ error: "Please enter your name" });
    }

    const eventDoc = await Event.findOne({
      _id: event,
      status: "approved",
    }).select("title location eventType images stalls");

    if (!eventDoc) {
      return res.status(404).json({ error: "Event not found" });
    }

    const parsedDate = new Date(eventDate);

    if (!eventDate || isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: "Please choose a valid event date" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (parsedDate < today) {
      return res.status(400).json({ error: "Event date cannot be in the past" });
    }

    const parsedGuests = Number(guests);

    if (!Number.isInteger(parsedGuests) || parsedGuests < 1) {
      return res.status(400).json({ error: "Number of guests must be at least 1" });
    }

    const dateKey = parsedDate.toISOString().slice(0, 10);
    const dayStart = new Date(`${dateKey}T00:00:00.000Z`);

    // ek din mein ek event ki sirf ek confirmed booking
    if (await isDateBooked(eventDoc._id, dayStart)) {
      return res.status(409).json({
        error: "This event is already booked for that date. Please choose another date",
      });
    }

    // ---- stalls validation ----
    const requested = Array.isArray(stalls) ? [...new Set(stalls.map(String))] : [];

    if (requested.some((id) => !mongoose.isValidObjectId(id))) {
      return res.status(400).json({ error: "Invalid stall selected" });
    }

    const eventStalls = eventDoc.stalls ?? [];
    const chosen = eventStalls.filter((s) => requested.includes(String(s._id)));

    // har stall isi event ka hona chahiye
    if (chosen.length !== requested.length) {
      return res.status(400).json({ error: "Selected stall does not belong to this event" });
    }

    if (eventStalls.length && !chosen.length) {
      return res.status(400).json({ error: "Please select at least one stall" });
    }

    if (
      await Attendee.exists({
        user: userId,
        event: eventDoc._id,
        registrationEventKey: `event:${eventDoc._id}:${dateKey}`,
      })
    ) {
      return res.status(409).json({
        error: "You have already requested this event for that date",
      });
    }

    const attendee = await Attendee.create({
      user: userId,
      event: eventDoc._id,
      eventName: eventDoc.title,
      ticketType: "Event Booking",
      registrationStatus: "registered",
      bookingStatus: "pending",
      passStatus: "pending",
      eventDate: dayStart,
      guests: parsedGuests,
      contactName,
      stalls: chosen.map((s) => s._id),
      stallNumbers: chosen.map((s) => String(s.stallNumber)),
      contactPhone: phone?.trim() || undefined,
      notes: message?.trim() || undefined,
      registrationEventKey: `event:${eventDoc._id}:${dateKey}`,
      uniqueKeysEnforced: true,
    });

    await attendee.populate(eventPopulate);

    return res.status(201).json({
      msg: "Booking request sent to the organizer",
      attendee,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: "You have already requested this event for that date",
      });
    }

    res.status(500).json({ error: error.message });
  }
};

// POST /book-expo
// { expo }
export const bookExpoTicket = async (req, res) => {
  try {
    const userId = getMyId(req);
    const { expo } = req.body;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(401).json({ error: "Please login again" });
    }

    if (!expo || !mongoose.isValidObjectId(expo)) {
      return res.status(400).json({ error: "Please select an expo" });
    }

    const user = await User.findById(userId).select("role status");

    if (!user || user.role !== "attendee") {
      return res.status(403).json({ error: "Only attendee accounts can book tickets" });
    }

    if (user.status !== "active") {
      return res.status(403).json({ error: "This account is not active" });
    }

    const expoDoc = await Expo.findById(expo).select("title status");

    if (!expoDoc || expoDoc.status !== "published") {
      return res.status(404).json({ error: "Expo not found" });
    }

    if (await Attendee.exists({ user: userId, expo })) {
      return res.status(409).json({
        error: "You have already requested a ticket for this expo",
      });
    }

    const attendee = await Attendee.create({
      user: userId,
      expo: expoDoc._id,
      eventName: expoDoc.title,
      ticketType: "Expo Entry Pass",
      registrationStatus: "registered",
      bookingStatus: "pending",
      passStatus: "pending",
      uniqueKeysEnforced: true,
    });

    await attendee.populate("expo", "title date location");

    return res.status(201).json({
      msg: "Ticket request sent to admin",
      attendee,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: "You have already requested a ticket for this expo",
      });
    }

    res.status(500).json({ error: error.message });
  }
};

// GET /my
export const getMyRegistrations = async (req, res) => {
  try {
    const userId = getMyId(req);

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(401).json({ error: "Please login again" });
    }

    const registrations = await Attendee.find({ user: userId })
      .populate(eventPopulate)
      .populate("expo", "title date location")
      .sort({ createdAt: -1 });

    return res.status(200).json({ registrations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ---------- EXHIBITOR ----------

// GET /requests
// Mere events ki bookings
export const getBookingRequests = async (req, res) => {
  try {
    const events = await Event.find({
      exhibitor: req.user._id,
    }).select("_id");

    const requests = await Attendee.find({
      event: { $in: events.map((e) => e._id) },
    })
      .populate("user", "name email phone")
      .populate("event", "title location eventType images")
      .sort({ createdAt: -1 });

    return res.status(200).json({ requests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const findOwnedBooking = async (req) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return { status: 400, error: "Invalid booking ID" };
  }

  const booking = await Attendee.findById(id).populate(
    "event",
    "exhibitor title location eventType"
  );

  if (!booking || !booking.event) {
    return { status: 404, error: "Booking not found" };
  }

  if (String(booking.event.exhibitor) !== String(req.user._id)) {
    return {
      status: 403,
      error: "This booking is not for your event",
    };
  }

  return { booking };
};

// PUT /requests/:id/approve
export const approveBooking = async (req, res) => {
  try {
    const found = await findOwnedBooking(req);

    if (found.error) {
      return res.status(found.status).json({ error: found.error });
    }

    const { booking } = found;

    if (booking.bookingStatus === "confirmed") {
      return res.status(409).json({
        error: "Booking is already approved",
      });
    }

    // approve ke waqt dobara check: us din koi aur booking pehle confirm ho chuki ho sakti hai
    if (await isDateBooked(booking.event._id, booking.eventDate, booking._id)) {
      return res.status(409).json({
        error: "Another booking is already confirmed for this event on that date",
      });
    }

    booking.bookingStatus = "confirmed";
    booking.registrationStatus = "confirmed";
    booking.passStatus = "issued";
    booking.decisionNote = "";
    booking.reviewedAt = new Date();

    await booking.save();
    await booking.populate("user", "name email phone");

    return res.status(200).json({
      msg: "Booking approved",
      booking,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /requests/:id/reject
// { note }
export const rejectBooking = async (req, res) => {
  try {
    const note = req.body.note?.trim();

    if (!note) {
      return res.status(400).json({
        error: "Please add a reason for rejection",
      });
    }

    const found = await findOwnedBooking(req);

    if (found.error) {
      return res.status(found.status).json({ error: found.error });
    }

    const { booking } = found;

    booking.bookingStatus = "cancelled";
    booking.registrationStatus = "cancelled";
    booking.passStatus = "revoked";
    booking.decisionNote = note;
    booking.reviewedAt = new Date();

    await booking.save();
    await booking.populate("user", "name email phone");

    return res.status(200).json({
      msg: "Booking rejected",
      booking,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};