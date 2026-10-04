import mongoose from "mongoose";
import Expo from "../models/Expo.js";
import Schedule from "../models/Schedule.js";
import Booth from "../models/Booth.js";
import ExhibitorApplication from "../models/ExhibitorApplication.js";

const PUBLIC_EXPO_FIELDS = "title description theme date location status banner";
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const findPublishedExpo = async (id) => {
  if (!mongoose.isValidObjectId(id)) return null;
  return Expo.findOne({ _id: id, status: "published" }).select(PUBLIC_EXPO_FIELDS);
};

// GET /api/public/expos
export const getPublicExpos = async (req, res) => {
  try {
    const expos = await Expo.find({ status: "published" }).select(PUBLIC_EXPO_FIELDS).sort({ date: 1 });
    return res.status(200).json({ expos });
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
      // pending request ko bhi attendee ke liye "reserved" dikhao
      status: b.status === "available" ? "available" : b.status === "occupied" ? "occupied" : "reserved",
      companyName: b.exhibitor ? companyByUser.get(String(b.exhibitor)) ?? null : null,
    }));

    return res.status(200).json({ booths: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};