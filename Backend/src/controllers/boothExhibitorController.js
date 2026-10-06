import mongoose from "mongoose";
import Booth from "../models/Booth.js";
import ExhibitorApplication from "../models/ExhibitorApplication.js";

const ACTIVE = ["pending", "reserved", "occupied"];

const isApprovedFor = (userId, expo) => ExhibitorApplication.exists({ userId, expo, status: "approved" });

// GET /available?expo=ID
export const getAvailableBooths = async (req, res) => {
  try {
    const { expo } = req.query;
    if (!expo || !mongoose.isValidObjectId(expo)) return res.status(400).json({ error: "Valid expo is required" });
    if (!(await isApprovedFor(req.user._id, expo))) {
      return res.status(403).json({ error: "Your application for this expo is not approved yet" });
    }
    const booths = await Booth.find({ expo, status: "available" }).sort({ boothNumber: 1 });
    return res.status(200).json({ booths });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /mine
export const getMyBooth = async (req, res) => {
  try {
    const booths = await Booth.find({ exhibitor: req.user._id, status: { $in: ACTIVE } }).populate("expo", "title date location");
    return res.status(200).json({ booths, booth: booths[0] ?? null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /:id/reserve
export const reserveBooth = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid booth ID" });

    const booth = await Booth.findById(id);
    if (!booth) return res.status(404).json({ error: "Booth not found" });
    if (booth.status !== "available") return res.status(409).json({ error: "Booth is not available" });

    if (!(await isApprovedFor(req.user._id, booth.expo))) {
      return res.status(403).json({ error: "Your application for this expo is not approved yet" });
    }
    if (await Booth.exists({ exhibitor: req.user._id, expo: booth.expo, status: { $in: ACTIVE } })) {
      return res.status(409).json({ error: "You already have an active booth for this expo. Release it first" });
    }

    const updated = await Booth.findOneAndUpdate(
      { _id: id, status: "available" },
      { status: "pending", exhibitor: req.user._id },
      { new: true }
    ).populate("expo", "title date location");
    if (!updated) return res.status(409).json({ error: "Booth was just taken by someone else" });

    return res.status(200).json({ msg: "Booth requested", booth: updated });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: "You already have an active booth for this expo. Release it first" });
    res.status(500).json({ error: error.message });
  }
};

// PUT /:id/release  (reserved booth chhodna ya pending request cancel karna)
export const releaseBooth = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid booth ID" });

    const booth = await Booth.findOne({ _id: id, exhibitor: req.user._id });
    if (!booth) return res.status(404).json({ error: "Booth not found" });

    booth.exhibitor = null;
    booth.status = "available";
    await booth.save();

    return res.status(200).json({ msg: "Booth released", booth });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /:id/details  (sirf admin-approved booth ke liye)
export const updateBoothDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid booth ID" });

    const booth = await Booth.findOne({ _id: id, exhibitor: req.user._id });
    if (!booth) return res.status(404).json({ error: "Booth not found" });
    if (booth.status === "pending") return res.status(403).json({ error: "Booth is awaiting admin approval" });

    const { products, staff } = req.body;
    if (Array.isArray(products)) {
      booth.products = products.map((p) => String(p).trim()).filter(Boolean).slice(0, 30);
    }
    if (Array.isArray(staff)) {
      booth.staff = staff
        .map((s) => ({ name: String(s?.name ?? "").trim(), role: String(s?.role ?? "").trim() }))
        .filter((s) => s.name && s.role)
        .slice(0, 20);
    }
    await booth.save();
    await booth.populate("expo", "title date location");

    return res.status(200).json({ msg: "Booth details updated", booth });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
