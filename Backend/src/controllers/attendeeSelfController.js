import mongoose from "mongoose";
import Attendee from "../models/Attendee.js";
import Event from "../models/Event.js";
import User from "../models/User.js";
import Expo from "../models/Expo.js";
import { generatePassCode } from "../utils/passCode.js";

const getMyId = (req) => String(req.user?.userId ?? req.user?._id ?? req.user?.id ?? req.user?.sub ?? "");

const eventPopulate = {
  path: "event",
  select: "title location eventType images",
};

const toDayRange = (date) => {
  const start = new Date(`${new Date(date).toISOString().slice(0, 10)}T00:00:00.000Z`);
  return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
};

const isDateBooked = async (eventId, date, excludeId) => {
  const { start, end } = toDayRange(date);
  const query = { event: eventId, bookingStatus: "confirmed", eventDate: { $gte: start, $lt: end } };
  if (excludeId) query._id = { $ne: excludeId };
  return !!(await Attendee.exists(query));
};


export const bookEvent = async (req, res) => {
  try {
    const userId = getMyId(req);
    const {
      event,
      isCustomEvent,
      customEventName,
      customEventImage,
      eventDate,
      guests,
      phone,
      message,
      stalls,
      name,
    } = req.body;
    const isCustom = isCustomEvent === true;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(401).json({ error: "Please login again" });
    }

    if (!isCustom && (!event || !mongoose.isValidObjectId(event))) {
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

    const trimmedCustomEventName =
      typeof customEventName === "string" ? customEventName.trim() : "";
    const trimmedCustomEventImage =
      typeof customEventImage === "string" ? customEventImage.trim() : "";
    if (isCustom && !trimmedCustomEventName) {
      return res.status(400).json({ error: "Please enter a custom event name" });
    }

    const eventDoc = isCustom
      ? null
      : await Event.findOne({
          _id: event,
          status: "approved",
        }).select("title location eventType images price stalls exhibitor");

    if (!isCustom && !eventDoc) {
      return res.status(404).json({ error: "Event not found" });
    }

    if (eventDoc) {
      const exhibitorActive = await User.exists({
        _id: eventDoc.exhibitor,
        status: "active",
      });
      if (!exhibitorActive) {
        return res.status(404).json({ error: "Event not found" });
      }
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

    if (eventDoc && (await isDateBooked(eventDoc._id, dayStart))) {
      return res.status(409).json({
        error: "This event is already booked for that date. Please choose another date",
      });
    }

    const requested = isCustom
      ? []
      : Array.isArray(stalls)
        ? [...new Set(stalls.map(String))]
        : [];

    if (!isCustom && requested.some((id) => !mongoose.isValidObjectId(id))) {
      return res.status(400).json({ error: "Invalid stall selected" });
    }

    const eventStalls = eventDoc?.stalls ?? [];
    const chosen = eventStalls.filter((s) => requested.includes(String(s._id)));

    if (chosen.length !== requested.length) {
      return res.status(400).json({ error: "Selected stall does not belong to this event" });
    }

    if (
      !isCustom &&
      (await Attendee.exists({
        user: userId,
        event: eventDoc._id,
        registrationEventKey: `event:${eventDoc._id}:${dateKey}`,
      }))
    ) {
      return res.status(409).json({
        error: "You have already requested this event for that date",
      });
    }

    const totalAmount =
      (eventDoc?.price ?? 0) + chosen.reduce((sum, s) => sum + (s.price ?? 0), 0);

    const attendee = await Attendee.create({
      user: userId,
      ...(eventDoc ? { event: eventDoc._id } : {}),
      eventName: isCustom ? trimmedCustomEventName : eventDoc.title,
      isCustomEvent: isCustom,
      ...(isCustom
        ? {
            customEventName: trimmedCustomEventName,
            customEventImage: trimmedCustomEventImage || undefined,
          }
        : {}),
      ticketType: "Event Booking",
      registrationStatus: "registered",
      bookingStatus: "pending",
      passStatus: "pending",
      eventDate: dayStart,
      guests: parsedGuests,
      contactName,
      stalls: chosen.map((s) => s._id),
      stallNumbers: chosen.map((s) => String(s.stallNumber)),
      totalAmount,
      contactPhone: phone?.trim() || undefined,
      notes: message?.trim() || undefined,
      ...(!isCustom
        ? {
            registrationEventKey: `event:${eventDoc._id}:${dateKey}`,
            uniqueKeysEnforced: true,
          }
        : {}),
    });

    await attendee.populate(eventPopulate);

    return res.status(201).json({
      msg: isCustom
        ? "Custom event request sent for admin review"
        : "Booking request sent to the exhibitor",
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

export const bookExpoTicket = async (req, res) => {
  try {
    const userId = getMyId(req);
    const { expo, guests } = req.body;

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

    let guestList = [];
    if (Array.isArray(guests) && guests.length > 0) {
      guestList = guests
        .filter((g) => g && typeof g.name === "string" && g.name.trim())
        .map((g) => ({
          name: g.name.trim(),
          phone: typeof g.phone === "string" ? g.phone.trim() : "",
        }));
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
      guestList,
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

export const approveBooking = async (req, res) => {
  try {
    const found = await findOwnedBooking(req);

    if (found.error) {
      return res.status(found.status).json({ error: found.error });
    }

    const { booking } = found;

    if (booking.passStatus === "scanned") {
      return res.status(409).json({ error: "This pass has already been used." });
    }

    if (booking.bookingStatus === "confirmed") {
      return res.status(409).json({
        error: "Booking is already approved",
      });
    }

    if (await isDateBooked(booking.event._id, booking.eventDate, booking._id)) {
      return res.status(409).json({
        error: "Another booking is already confirmed for this event on that date",
      });
    }

    booking.bookingStatus = "confirmed";
    booking.registrationStatus = "confirmed";
    booking.passStatus = "issued";
    if (!booking.passCode) {
      const passCode = await generatePassCode();
      if (!passCode) {
        return res.status(503).json({ error: "Could not generate entry pass. Please try again" });
      }
      booking.passCode = passCode;
      booking.entryPassId = passCode;
    } else if (!booking.entryPassId) {
      booking.entryPassId = booking.passCode;
    }
    booking.checkedInAt = undefined;
    booking.decisionNote = "";
    booking.reviewedAt = new Date();

    try {
      await booking.save();
    } catch (error) {
      if (error.code === 11000) {
        return res.status(503).json({ error: "Entry pass clash, please try again" });
      }
      throw error;
    }
    await booking.populate("user", "name email phone");

    return res.status(200).json({
      msg: "Booking approved",
      booking,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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

    if (booking.passStatus === "scanned") {
      return res.status(409).json({ error: "A checked-in booking cannot be rejected." });
    }

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
