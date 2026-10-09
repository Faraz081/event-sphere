import mongoose from "mongoose";
import User from "../models/User.js";
import Expo from "../models/Expo.js";
import Schedule from "../models/Schedule.js";
import Booth from "../models/Booth.js";
import Event from "../models/Event.js";
import Attendee from "../models/Attendee.js";
import ExhibitorApplication from "../models/ExhibitorApplication.js";

const PUBLIC_EXPO_FIELDS = "title description theme date location status banner";

const PUBLIC_EVENT_FIELDS = "title description eventType location images banner exhibitor";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findPublishedExpo = async (id) => {
  if (!mongoose.isValidObjectId(id)) return null;

  return Expo.findOne({ _id: id, status: "published" }).select(PUBLIC_EXPO_FIELDS);
};

// GET /api/public/expos

export const getPublicExpos = async (req, res) => {
  try {
    const expos = await Expo.find({ status: "published" }).select(PUBLIC_EXPO_FIELDS).sort({ date: 1 });

    const applications = await ExhibitorApplication.find({
      expo: { $in: expos.map((expo) => expo._id) },
      status: "approved",
    }).select("expo companyName");

    const companiesByExpo = new Map();

    applications.forEach(({ expo, companyName }) => {
      const expoId = String(expo);
      const companies = companiesByExpo.get(expoId) || [];
      companies.push(companyName);
      companiesByExpo.set(expoId, companies);
    });

    const exposWithExhibitors = expos.map((expo) => ({
      ...expo.toObject(),
      exhibitors: companiesByExpo.get(String(expo._id)) || [],
    }));

    return res.status(200).json({ expos: exposWithExhibitors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/public/expos/:id  (expo + schedule)

export const getPublicExpo = async (req, res) => {
  try {
    const expo = await findPublishedExpo(req.params.id);

    if (!expo) return res.status(404).json({ error: "Expo not found" });

    const schedules = await Schedule.find({ expo: expo._id })
      .select("title speaker topic location startTime endTime")
      .sort({ startTime: 1 });

    return res.status(200).json({ expo, schedules });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/public/expos/:id/exhibitors?search=

export const getPublicExhibitors = async (req, res) => {
  try {
    const expo = await findPublishedExpo(req.params.id);

    if (!expo) return res.status(404).json({ error: "Expo not found" });

    const filter = { expo: expo._id, status: "approved" };
    const search = req.query.search?.trim();

    if (search) {
      const re = new RegExp(escapeRegex(search), "i");
      filter.$or = [{ companyName: re }, { productsServices: re }, { description: re }];
    }

    const applications = await ExhibitorApplication.find(filter)
      .select("userId companyName productsServices description logo")
      .sort({ companyName: 1 });

    const booths = await Booth.find({
      expo: expo._id,
      exhibitor: { $in: applications.map((a) => a.userId) },
      status: { $in: ["reserved", "occupied"] },
    }).select("boothNumber size location exhibitor");

    const boothByUser = new Map(booths.map((b) => [String(b.exhibitor), b]));

    const exhibitors = applications.map((a) => {
      const b = boothByUser.get(String(a.userId));

      return {
        _id: a._id,
        userId: a.userId,
        companyName: a.companyName,
        productsServices: a.productsServices,
        description: a.description,
        logo: a.logo,
        booth: b ? { boothNumber: b.boothNumber, size: b.size, location: b.location } : null,
      };
    });

    return res.status(200).json({ exhibitors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/public/expos/:id/booths  (floor plan)

export const getPublicBooths = async (req, res) => {
  try {
    const expo = await findPublishedExpo(req.params.id);

    if (!expo) return res.status(404).json({ error: "Expo not found" });

    const [booths, applications] = await Promise.all([
      Booth.find({ expo: expo._id }).select("boothNumber size location status exhibitor").sort({ boothNumber: 1 }),
      ExhibitorApplication.find({ expo: expo._id, status: "approved" }).select("userId companyName"),
    ]);

    const companyByUser = new Map(applications.map((a) => [String(a.userId), a.companyName]));

    const result = booths.map((b) => ({
      _id: b._id,
      boothNumber: b.boothNumber,
      size: b.size,
      location: b.location,
      status: b.status === "available" ? "available" : b.status === "occupied" ? "occupied" : "reserved",
      companyName: b.exhibitor ? companyByUser.get(String(b.exhibitor)) ?? null : null,
    }));

    return res.status(200).json({ booths: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/public/events  (approved, upcoming)

// GET /api/public/events  (approved events)

export const getPublicEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "approved" })
      .select(PUBLIC_EVENT_FIELDS)
      .populate("exhibitor", "name")
      .sort({ createdAt: -1 });

    const exhibitorIds = events.map((e) => e.exhibitor?._id).filter(Boolean);

    const applications = await ExhibitorApplication.find({
      userId: { $in: exhibitorIds },
    }).select("userId companyName");

    const companyByUser = new Map(applications.map((a) => [String(a.userId), a.companyName]));

    const result = events.map((e) => ({
      ...e.toObject(),
      exhibitorName: e.exhibitor?.name ?? null,
      companyName: companyByUser.get(String(e.exhibitor?._id)) ?? null,
    }));

    return res.status(200).json({ events: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/public/exhibitors/:id  (exhibitor company details + approved events)

export const getPublicExhibitorProfile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) return res.status(404).json({ error: "Exhibitor not found" });

    const user = await User.findOne({ _id: id, role: "exhibitor", status: "active" }).select("name companyName avatar");

    if (!user) return res.status(404).json({ error: "Exhibitor not found" });

    const application = await ExhibitorApplication.findOne({ userId: id, status: "approved" })
      .select("companyName productsServices description logo")
      .sort({ updatedAt: -1 });

    const events = await Event.find({ exhibitor: id, status: "approved" }).select(PUBLIC_EVENT_FIELDS).sort({ createdAt: -1 });

    return res.status(200).json({
      exhibitor: {
        _id: user._id,
        name: user.name,
        companyName: application?.companyName ?? user.companyName ?? user.name,
        description: application?.description ?? "",
        productsServices: application?.productsServices ?? "",
        logo: application?.logo || user.avatar || "",
      },
      events,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/public/events/:id/stalls?date=YYYY-MM-DD  (stalls + us date par booked hain ya nahi)

export const getPublicEventStalls = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) return res.status(404).json({ error: "Event not found" });

    const event = await Event.findOne({ _id: id, status: "approved" }).select("stalls");

    if (!event) return res.status(404).json({ error: "Event not found" });

    const bookedIds = new Set();
    const { date } = req.query;

    if (date) {
      const start = new Date(`${date}T00:00:00.000Z`);

      if (isNaN(start.getTime())) return res.status(400).json({ error: "Invalid date" });

      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

      const bookings = await Attendee.find({
        event: id,
        bookingStatus: "confirmed",
        eventDate: { $gte: start, $lt: end },
      }).select("stalls");

      bookings.forEach((b) => (b.stalls ?? []).forEach((s) => bookedIds.add(String(s))));
    }

    const stalls = event.stalls.map((s) => ({
      _id: s._id,
      stallNumber: s.stallNumber,
      name: s.name,
      size: s.size,
      description: s.description,
      booked: bookedIds.has(String(s._id)),
    }));

    return res.status(200).json({ stalls });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};