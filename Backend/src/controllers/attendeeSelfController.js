import mongoose from "mongoose";
import Attendee from "../models/Attendee.js";
import Event from "../models/Event.js";
import User from "../models/User.js";
import Expo from "../models/Expo.js";

const ONE_DAY = 24 * 60 * 60 * 1000;

const getMyId = (req) => String(req.user?.userId ?? req.user?._id ?? req.user?.id ?? req.user?.sub ?? "");

const eventPopulate = { path: "event", select: "title location eventType images" };

const startOfDay = (date) => new Date(`${new Date(date).toISOString().slice(0, 10)}T00:00:00.000Z`);
const isDateBooked = async (eventId, date, excludeId) => {
  const start = startOfDay(date);
  const query = {
    event: eventId,
    bookingStatus: "confirmed",
    eventDate: { $gte: start, $lt: new Date(start.getTime() + ONE_DAY) },
  };
  if (excludeId) query._id = { $ne: excludeId };
  return !!(await Attendee.exists(query));
};

const checkBookingUser = async (userId, action) => {
  const user = await User.findById(userId).select("role status");
  if (!user || user.role !== "attendee") 
    return `Only attendee accounts can ${action}`;
  if (user.status !== "active") 
    return "This account is not active";
  return null;
};

export const bookEvent = async (req, res) => {
  try {
    const userId = getMyId(req);
    const { event, isCustomEvent, customEventName, customEventImage, exhibitor: requestedExhibitorId, eventDate, guests, phone, message, stalls, name } = req.body;
    const isCustom = isCustomEvent === true;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(401).json({ error: "Please login again" });
    }
    if (!isCustom && (!event || !mongoose.isValidObjectId(event))) {
      return res.status(400).json({ error: "Please select an event" });
    }

    const accountError = await checkBookingUser(userId, "book events");
    if (accountError) {
      return res.status(403).json({ error: accountError });
    }

    const contactName = name?.trim();
    if (!contactName) {
      return res.status(400).json({ error: "Please enter your name" });
    }

    const customName = typeof customEventName === "string" ? customEventName.trim() : "";
    const customImage = typeof customEventImage === "string" ? customEventImage.trim() : "";
    if (isCustom && !customName) {
      return res.status(400).json({ error: "Please enter a custom event name" });
    }

    let customExhibitor = null;
    if (isCustom) {
      if (!requestedExhibitorId || !mongoose.isValidObjectId(requestedExhibitorId)) {
        return res.status(400).json({ error: "Please select a valid exhibitor" });
      }
      customExhibitor = await User.findOne({
        _id: requestedExhibitorId,
        role: "exhibitor",
        status: "active",
        exhibitorStatus: "approved",
      }).select("_id");
      if (!customExhibitor) {
        return res.status(404).json({ error: "Exhibitor not found or not approved" });
      }
    }

    const eventDoc = isCustom ? null : await Event.findOne({ _id: event, status: "approved" }).select("title location eventType images price stalls exhibitor");
    if (!isCustom && !eventDoc) {
      return res.status(404).json({ error: "Event not found" });
    }
    if (eventDoc && !(await User.exists({ _id: eventDoc.exhibitor, status: "active" }))) {
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
    const dayStart = startOfDay(parsedDate);
    if (eventDoc && (await isDateBooked(eventDoc._id, dayStart))) {
      return res.status(409).json({ error: "This event is already booked for that date. Please choose another date" });
    }

    const requested = isCustom || !Array.isArray(stalls) ? [] : [...new Set(stalls.map(String))];
    if (requested.some((id) => !mongoose.isValidObjectId(id))) {
      return res.status(400).json({ error: "Invalid stall selected" });
    }
    const chosen = (eventDoc?.stalls ?? []).filter((s) => requested.includes(String(s._id)));
    if (chosen.length !== requested.length) {
      return res.status(400).json({ error: "Selected stall does not belong to this event" });
    }

    const bookingKey = isCustom ? undefined : `event:${eventDoc._id}:${dateKey}`;
    if (bookingKey && (await Attendee.exists({ user: userId, event: eventDoc._id, registrationEventKey: bookingKey }))) {
      return res.status(409).json({ error: "You have already requested this event for that date" });
    }

    const totalAmount = (eventDoc?.price ?? 0) + chosen.reduce((sum, s) => sum + (s.price ?? 0), 0);

    const attendee = await Attendee.create({
      user: userId,
      event: eventDoc?._id,
      exhibitor: customExhibitor?._id,
      eventName: isCustom ? customName : eventDoc.title,
      isCustomEvent: isCustom,
      customEventName: isCustom ? customName : undefined,
      customEventImage: (isCustom && customImage) || undefined,
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
      registrationEventKey: bookingKey,
      uniqueKeysEnforced: !!bookingKey,
    });

    await attendee.populate(eventPopulate);
    await attendee.populate("exhibitor", "name companyName");

    return res.status(201).json({
      msg: isCustom ? "Request sent to the exhibitor for approval" : "Booking request sent to the exhibitor",
      attendee,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: "You have already requested this event for that date" });
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

    const accountError = await checkBookingUser(userId, "book tickets");
    if (accountError) {
      return res.status(403).json({ error: accountError });
    }

    const expoDoc = await Expo.findById(expo).select("title status");
    if (!expoDoc || expoDoc.status !== "published") {
      return res.status(404).json({ error: "Expo not found" });
    }
    if (await Attendee.exists({ user: userId, expo })) {
      return res.status(409).json({ error: "You have already requested a ticket for this expo" });
    }

    const guestList = Array.isArray(guests)
      ? guests
          .filter((g) => g && typeof g.name === "string" && g.name.trim())
          .map((g) => ({ name: g.name.trim(), phone: typeof g.phone === "string" ? g.phone.trim() : "" }))
      : [];

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

    return res.status(201).json({ msg: "Ticket request sent to admin", attendee });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: "You have already requested a ticket for this expo" });
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
      .populate("exhibitor", "name companyName")
      .populate("expo", "title date location")
      .sort({ createdAt: -1 });

    return res.status(200).json({ registrations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getBookingRequests = async (req, res) => {
  try {
    const myEvents = await Event.find({ exhibitor: req.user._id }).select("_id");

    const requests = await Attendee.find({
      $or: [
        { event: { $in: myEvents.map((e) => e._id) } },
        { isCustomEvent: true, exhibitor: req.user._id },
      ],
    })
      .populate("user", "name email phone")
      .populate("event", "title location eventType images")
      .populate("exhibitor", "name companyName")
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

  const booking = await Attendee.findById(id).populate("event", "exhibitor title location eventType");
  if (!booking) {
    return { status: 404, error: "Booking not found" };
  }

  const assignedExhibitorId = booking.isCustomEvent ? booking.exhibitor : booking.event?.exhibitor;
  if (!assignedExhibitorId) {
    return { status: 404, error: "Booking not found" };
  }
  if (String(assignedExhibitorId) !== String(req.user._id)) {
    return { status: 403, error: "This booking is not for your event" };
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
      return res.status(409).json({ error: "Booking is already approved" });
    }
    if (booking.event && (await isDateBooked(booking.event._id, booking.eventDate, booking._id))) {
      return res.status(409).json({ error: "Another booking is already confirmed for this event on that date" });
    }

    booking.bookingStatus = "confirmed";
    booking.registrationStatus = "confirmed";
    booking.checkedInAt = undefined;
    booking.decisionNote = "";
    booking.reviewedAt = new Date();

    await booking.save();
    await booking.populate("user", "name email phone");

    return res.status(200).json({ msg: "Booking approved", booking });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(503).json({ error: "Entry pass clash, please try again" });
    }
    res.status(500).json({ error: error.message });
  }
};

export const rejectBooking = async (req, res) => {
  try {
    const note = req.body.note?.trim();
    if (!note) {
      return res.status(400).json({ error: "Please add a reason for rejection" });
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

    return res.status(200).json({ msg: "Booking rejected", booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};