import Booth from "../models/Booth.js";
import mongoose from "mongoose";
import Expo from "../models/Expo.js";
import { isExpoEnded } from "../utils/expoStatus.js";

export const createBooth = async (req, res) => {
  try {
    const { expo, boothNumber, size, price, status, exhibitor, location } = req.body;

    if (!expo || !boothNumber) {
      return res.status(400).json({ error: "Expo and booth number are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(expo)) {
      return res.status(400).json({ error: "Invalid expo ID" });
    }

    const selectedExpo = await Expo.findById(expo);
    if (!selectedExpo) {
      return res.status(404).json({ error: "Expo not found" });
    }

    if (isExpoEnded(selectedExpo) && exhibitor) {
      return res.status(400).json({ error: "Cannot assign an exhibitor to a completed, cancelled or past expo" });
    }

    const existing = await Booth.findOne({ expo, boothNumber: boothNumber.trim() });
    if (existing) {
      return res.status(409).json({ error: "Booth number already exists in this expo" });
    }

    const totalBooths = await Booth.countDocuments({ expo });
    if (totalBooths >= (selectedExpo.maxBooths || 10)) {
      return res.status(400).json({ error: "Booth full for this expo" });
    }

    const nextStatus = status || (exhibitor ? "reserved" : "available");
    if (exhibitor && ["pending", "reserved", "occupied"].includes(nextStatus) && await Booth.exists({ exhibitor, expo, status: { $in: ["pending", "reserved", "occupied"] } })) {
      return res.status(409).json({ error: "This exhibitor already has an active booth for this expo" });
    }

    const booth = await Booth.create({
      expo,
      boothNumber: boothNumber.trim(),
      size,
      price: price || 0,
      status: nextStatus,
      exhibitor: exhibitor || null,
      location,
    });

    const populated = await Booth.findById(booth._id)
      .populate("expo", "title date location")
      .populate("exhibitor", "name companyName email");

    return res.status(201).json({
      success: true,
      msg: "Booth created successfully",
      booth: populated,
    });
  } catch (error) {
    console.error("createBooth error:", error);
    if (error.code === 11000) return res.status(409).json({ error: "This exhibitor already has an active booth for this expo" });
    res.status(500).json({ error: error.message || "Failed to create booth" });
  }
};

export const getAllBooths = async (req, res) => {
  try {
    const { expo, status, search, sortBy = "createdAt", sortOrder = "desc" } = req.query;

    const filter = {};

    if (expo && expo !== "all") {
      filter.expo = expo;
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search && search.trim() !== "") {
      const cleanSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(cleanSearch, "i");
      filter.$or = [
        { boothNumber: searchRegex },
        { location: searchRegex },
        { size: searchRegex },
      ];
    }

    const sortOption = {};
    sortOption[sortBy] = sortOrder === "asc" ? 1 : -1;

    const booths = await Booth.find(filter)
      .populate("expo", "title date location status maxBooths")
      .populate("exhibitor", "name companyName email")
      .sort(sortOption);

    const total = await Booth.countDocuments(filter);
    const selectedExpo = expo && expo !== "all" ? await Expo.findById(expo) : null;
    const expoTotalBooths = selectedExpo ? await Booth.countDocuments({ expo: selectedExpo._id }) : null;
    const maxBooths = selectedExpo ? selectedExpo.maxBooths || 10 : null;

    res.status(200).json({
      success: true,
      total,
      ...(selectedExpo && {
        totalBooths: expoTotalBooths,
        maxBooths,
        remainingSlots: Math.max(0, maxBooths - expoTotalBooths),
      }),
      booths,
    });
  } catch (error) {
    console.error("getAllBooths error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch booths" });
  }
};

export const getBoothById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid booth ID" });
    }

    const booth = await Booth.findById(id)
      .populate("expo", "title date location status")
      .populate("exhibitor", "name companyName email phone");

    if (!booth) {
      return res.status(404).json({ error: "Booth not found" });
    }

    res.status(200).json({
      success: true,
      booth,
    });
  } catch (error) {
    console.error("getBoothById error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch booth" });
  }
};

export const updateBooth = async (req, res) => {
  try {
    const { id } = req.params;
    const { boothNumber, size, price, status, exhibitor, location, expo } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid booth ID" });
    }

    const booth = await Booth.findById(id);
    if (!booth) {
      return res.status(404).json({ error: "Booth not found" });
    }

    const nextExpo = expo ?? booth.expo;
    if (!mongoose.Types.ObjectId.isValid(nextExpo)) {
      return res.status(400).json({ error: "Invalid expo ID" });
    }
    const isMovingToAnotherExpo = nextExpo.toString() !== booth.expo.toString();

    const targetExpo = await Expo.findById(nextExpo);
    if (!targetExpo) {
      return res.status(404).json({ error: "Expo not found" });
    }
    const assigningExhibitor = exhibitor !== undefined && exhibitor;
    if (isExpoEnded(targetExpo) && (assigningExhibitor || isMovingToAnotherExpo)) {
      return res.status(400).json({ error: "This expo has ended. Booths cannot be assigned or moved into it" });
    }

    const nextExhibitor = exhibitor !== undefined ? (exhibitor || null) : booth.exhibitor;
    let nextStatus = status ?? booth.status;
    if (exhibitor !== undefined && exhibitor && nextStatus === "available") nextStatus = "reserved";
    if (exhibitor !== undefined && !exhibitor && ["reserved", "occupied"].includes(nextStatus)) nextStatus = "available";
    if (nextExhibitor && ["pending", "reserved", "occupied"].includes(nextStatus) && await Booth.exists({ exhibitor: nextExhibitor, expo: nextExpo, status: { $in: ["pending", "reserved", "occupied"] }, _id: { $ne: id } })) {
      return res.status(409).json({ error: "This exhibitor already has an active booth for this expo" });
    }

    if (boothNumber && boothNumber.trim() !== booth.boothNumber) {
      const existing = await Booth.findOne({
        expo: expo || booth.expo,
        boothNumber: boothNumber.trim(),
        _id: { $ne: id },
      });
      if (existing) {
        return res.status(409).json({ error: "Booth number already exists in this expo" });
      }
      booth.boothNumber = boothNumber.trim();
    }

    if (isMovingToAnotherExpo) {
      const destinationCount = await Booth.countDocuments({ expo: nextExpo });
      if (destinationCount >= (targetExpo.maxBooths || 10)) {
        return res.status(400).json({ error: "Booth full for this expo" });
      }
    }

    if (size !== undefined) booth.size = size;
    if (price !== undefined) booth.price = price;
    if (status !== undefined) booth.status = status;
    if (location !== undefined) booth.location = location;
    if (expo !== undefined) booth.expo = expo;

    if (exhibitor !== undefined) {
      booth.exhibitor = exhibitor || null;
      if (exhibitor && booth.status === "available") {
        booth.status = "reserved";
      }
      if (!exhibitor && (booth.status === "reserved" || booth.status === "occupied")) {
        booth.status = "available";
      }
    }

    await booth.save();

    const updated = await Booth.findById(id)
      .populate("expo", "title date location")
      .populate("exhibitor", "name companyName email");

    res.status(200).json({
      success: true,
      msg: "Booth updated successfully",
      booth: updated,
    });
  } catch (error) {
    console.error("updateBooth error:", error);
    if (error.code === 11000) return res.status(409).json({ error: "This exhibitor already has an active booth for this expo" });
    res.status(500).json({ error: error.message || "Failed to update booth" });
  }
};

export const deleteBooth = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid booth ID" });
    }

    const booth = await Booth.findByIdAndDelete(id);

    if (!booth) {
      return res.status(404).json({ error: "Booth not found" });
    }

    res.status(200).json({
      success: true,
      msg: "Booth deleted successfully",
    });
  } catch (error) {
    console.error("deleteBooth error:", error);
    res.status(500).json({ error: error.message || "Failed to delete booth" });
  }
};