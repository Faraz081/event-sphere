import mongoose from "mongoose";
import Expo from "../models/Expo.js";

const VALID_STATUSES = ["draft", "published", "completed", "cancelled"];

// CREATE Expo
export const createExpo = async (req, res) => {
  try {
    const { title, description, theme, date, location, status, banner } = req.body;

    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }
    if (typeof description !== "string" || !description.trim()) {
      return res.status(400).json({ error: "Description is required" });
    }
    if (typeof location !== "string" || !location.trim()) {
      return res.status(400).json({ error: "Location is required" });
    }
    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    if (parsedDate < startOfToday) {
      return res.status(400).json({ error: "Expo date must be today or in the future" });
    }

    let expoStatus = "draft";
    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
        });
      }
      expoStatus = status;
    }

    const createdBy = req.user?._id || req.user?.id || req.user?.sub;
    if (!createdBy) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const expo = await Expo.create({
      title: title.trim(),
      description: description.trim(),
      theme: typeof theme === "string" ? theme.trim() : "",
      date: parsedDate,
      location: location.trim(),
      status: expoStatus,
      banner: typeof banner === "string" ? banner : "",
      createdBy,
    });

    await expo.populate("createdBy", "name email");

    return res.status(201).json({
      success: true,
      msg: "Expo created successfully",
      expo,
    });
  } catch (error) {
    console.error("createExpo error:", error);
    return res.status(500).json({ error: error.message || "Failed to create expo" });
  }
};

// GET all expos with optional filtering and pagination.
export const getAllExpos = async (req, res) => {
  try {
    const { status, search, page, limit } = req.query;
    const filter = {};

    if (status && status !== "all") {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          error: `Invalid status filter. Must be one of: ${VALID_STATUSES.join(", ")}`,
        });
      }
      filter.status = status;
    }

    if (search && search.trim()) {
      const cleanSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(cleanSearch, "i");
      filter.$or = [
        { title: searchRegex },
        { location: searchRegex },
        { theme: searchRegex },
      ];
    }

    const total = await Expo.countDocuments(filter);
    const isLimitSpecified = limit !== undefined && limit !== "";
    const isPageSpecified = page !== undefined && page !== "";
    const pageNum = Math.max(1, Number.parseInt(page, 10) || 1);
    const limitNum = isLimitSpecified
      ? (limit === "all" ? 0 : Math.max(1, Number.parseInt(limit, 10) || 10))
      : (isPageSpecified ? 10 : 0);

    let query = Expo.find(filter)
      .populate("createdBy", "name email")
      .sort({ date: -1 });

    if (limitNum > 0) {
      query = query.skip((pageNum - 1) * limitNum).limit(limitNum);
    }

    const expos = await query;

    return res.status(200).json({
      success: true,
      total,
      page: pageNum,
      limit: limitNum > 0 ? limitNum : total,
      totalPages: limitNum > 0 ? (Math.ceil(total / limitNum) || 1) : 1,
      expos,
    });
  } catch (error) {
    console.error("getAllExpos error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch expos" });
  }
};

// GET Single Expo
export const getExpoById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid expo ID" });
    }

    const expo = await Expo.findById(id).populate("createdBy", "name email");
    if (!expo) {
      return res.status(404).json({ error: "Expo not found" });
    }

    return res.status(200).json({ success: true, expo });
  } catch (error) {
    console.error("getExpoById error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch expo" });
  }
};

// Update only validated expo fields, preserving createdBy.
export const updateExpo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid expo ID" });
    }

    const updates = {};

    if (req.body.title !== undefined) {
      if (typeof req.body.title !== "string" || !req.body.title.trim()) {
        return res.status(400).json({ error: "Title cannot be empty" });
      }
      updates.title = req.body.title.trim();
    }

    if (req.body.description !== undefined) {
      if (typeof req.body.description !== "string" || !req.body.description.trim()) {
        return res.status(400).json({ error: "Description cannot be empty" });
      }
      updates.description = req.body.description.trim();
    }

    if (req.body.location !== undefined) {
      if (typeof req.body.location !== "string" || !req.body.location.trim()) {
        return res.status(400).json({ error: "Location cannot be empty" });
      }
      updates.location = req.body.location.trim();
    }

    if (req.body.theme !== undefined) {
      if (typeof req.body.theme !== "string") {
        return res.status(400).json({ error: "Theme must be a string" });
      }
      updates.theme = req.body.theme.trim();
    }

    if (req.body.banner !== undefined) {
      if (typeof req.body.banner !== "string") {
        return res.status(400).json({ error: "Banner must be a string" });
      }
      updates.banner = req.body.banner;
    }

    if (req.body.date !== undefined) {
      const parsedDate = new Date(req.body.date);
      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }
      updates.date = parsedDate;
    }

    if (req.body.status !== undefined) {
      if (!VALID_STATUSES.includes(req.body.status)) {
        return res.status(400).json({
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
        });
      }
      updates.status = req.body.status;
    }

    const expo = await Expo.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("createdBy", "name email");

    if (!expo) {
      return res.status(404).json({ error: "Expo not found" });
    }

    return res.status(200).json({
      success: true,
      msg: "Expo updated successfully",
      expo,
    });
  } catch (error) {
    console.error("updateExpo error:", error);
    return res.status(500).json({ error: error.message || "Failed to update expo" });
  }
};

// DEDICATED STATUS CHANGE
export const updateExpoStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid expo ID" });
    }

    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    const expo = await Expo.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    ).populate("createdBy", "name email");

    if (!expo) {
      return res.status(404).json({ error: "Expo not found" });
    }

    return res.status(200).json({
      success: true,
      msg: "Expo status updated successfully",
      expo,
    });
  } catch (error) {
    console.error("updateExpoStatus error:", error);
    return res.status(500).json({ error: error.message || "Failed to update expo status" });
  }
};

// DELETE Expo
export const deleteExpo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid expo ID" });
    }

    const expo = await Expo.findByIdAndDelete(id);
    if (!expo) {
      return res.status(404).json({ error: "Expo not found" });
    }

    return res.status(200).json({
      success: true,
      msg: "Expo deleted successfully",
    });
  } catch (error) {
    console.error("deleteExpo error:", error);
    return res.status(500).json({ error: error.message || "Failed to delete expo" });
  }
};
