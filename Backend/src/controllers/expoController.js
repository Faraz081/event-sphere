import Expo from "../models/Expo.js";
import mongoose from "mongoose";

// CREATE Expo
export const createExpo = async (req, res) => {
  try {
    const { title, description, theme, date, location, status, banner } = req.body;

    if (!title || !description || !date || !location) {
      return res.status(400).json({ error: "Title, description, date and location are required" });
    }

    // logged-in admin se createdBy lo
    const createdBy = req.user?._id || req.user?.id || req.user?.sub;

    if (!createdBy) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const expo = await Expo.create({
      title,
      description,
      theme,
      date,
      location,
      status: status || "draft",
      banner,
      createdBy,
    });

    res.status(201).json({
      success: true,
      msg: "Expo created successfully",
      expo,
    });
  } catch (error) {
    console.error("createExpo error:", error);
    res.status(500).json({ error: error.message || "Failed to create expo" });
  }
};

// GET All Expos
export const getAllExpos = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [{ title: regex }, { location: regex }, { theme: regex }];
    }

    const expos = await Expo.find(filter)
      .populate("createdBy", "name email")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      total: expos.length,
      expos,
    });
  } catch (error) {
    console.error("getAllExpos error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch expos" });
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

    res.status(200).json({ success: true, expo });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to fetch expo" });
  }
};

// UPDATE Expo
export const updateExpo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid expo ID" });
    }

    const expo = await Expo.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "name email");

    if (!expo) {
      return res.status(404).json({ error: "Expo not found" });
    }

    res.status(200).json({
      success: true,
      msg: "Expo updated successfully",
      expo,
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to update expo" });
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

    res.status(200).json({
      success: true,
      msg: "Expo deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to delete expo" });
  }
};