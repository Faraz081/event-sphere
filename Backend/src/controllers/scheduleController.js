import Schedule from "../models/Schedule.js";
import Expo from "../models/Expo.js";
import mongoose from "mongoose";

// CREATE Schedule
export const createSchedule = async (req, res) => {
  try {
    const { expo, expoId, title, speaker, topic, location, startTime, endTime } = req.body;

    const targetExpoId = expo || expoId;

    if (!targetExpoId) {
      return res.status(400).json({ error: "Expo is required" });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }
    if (!startTime) {
      return res.status(400).json({ error: "Start time is required" });
    }
    if (!endTime) {
      return res.status(400).json({ error: "End time is required" });
    }

    // Validate Expo ObjectId
    if (!mongoose.Types.ObjectId.isValid(targetExpoId)) {
      return res.status(400).json({ error: "Invalid expo ID" });
    }

    // Verify selected Expo exists
    const expoExists = await Expo.findById(targetExpoId);
    if (!expoExists) {
      return res.status(404).json({ error: "Selected expo does not exist" });
    }

    // Validate times
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime())) {
      return res.status(400).json({ error: "Invalid start time format" });
    }
    if (isNaN(end.getTime())) {
      return res.status(400).json({ error: "Invalid end time format" });
    }
    if (start >= end) {
      return res.status(400).json({ error: "Start time must be before end time" });
    }

    const schedule = await Schedule.create({
      expo: expoExists._id,
      title: title.trim(),
      speaker: speaker ? speaker.trim() : "",
      topic: topic ? topic.trim() : "",
      location: location ? location.trim() : "",
      startTime: start,
      endTime: end,
    });

    await schedule.populate("expo", "title date location status");

    return res.status(201).json({
      success: true,
      msg: "Schedule created successfully",
      schedule,
      addSchedule: schedule, // Backwards compatibility with initial implementation
    });
  } catch (error) {
    console.error("createSchedule error:", error);
    return res.status(500).json({ error: error.message || "Failed to create schedule" });
  }
};

// GET All Schedules (with expoId filtering, chronological sorting, and expo population)
export const getAllSchedules = async (req, res) => {
  try {
    const { expo, expoId, search } = req.query;
    const filter = {};

    const targetExpoId = expo || expoId;
    if (targetExpoId && targetExpoId !== "all") {
      if (!mongoose.Types.ObjectId.isValid(targetExpoId)) {
        return res.status(400).json({ error: "Invalid expo ID filter" });
      }
      filter.expo = targetExpoId;
    }

    if (search && search.trim()) {
      const cleanSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(cleanSearch, "i");
      filter.$or = [
        { title: searchRegex },
        { speaker: searchRegex },
        { topic: searchRegex },
        { location: searchRegex },
      ];
    }

    const schedules = await Schedule.find(filter)
      .populate("expo", "title date location status")
      .sort({ startTime: 1 }); // Sort chronologically

    return res.status(200).json({
      success: true,
      total: schedules.length,
      schedules,
    });
  } catch (error) {
    console.error("getAllSchedules error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch schedules" });
  }
};

// GET Single Schedule
export const getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid schedule ID" });
    }

    const schedule = await Schedule.findById(id).populate("expo", "title date location status");
    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    return res.status(200).json({
      success: true,
      schedule,
    });
  } catch (error) {
    console.error("getScheduleById error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch schedule" });
  }
};

// UPDATE Schedule (validate allowed fields, verify expo exists, validate startTime < endTime)
export const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid schedule ID" });
    }

    const existingSchedule = await Schedule.findById(id);
    if (!existingSchedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    const updates = {};

    // Validate expo if changed
    const targetExpoId = req.body.expo || req.body.expoId;
    if (targetExpoId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(targetExpoId)) {
        return res.status(400).json({ error: "Invalid expo ID" });
      }
      const expoExists = await Expo.findById(targetExpoId);
      if (!expoExists) {
        return res.status(404).json({ error: "Selected expo does not exist" });
      }
      updates.expo = expoExists._id;
    }

    if (req.body.title !== undefined) {
      if (!req.body.title || !req.body.title.trim()) {
        return res.status(400).json({ error: "Title cannot be empty" });
      }
      updates.title = req.body.title.trim();
    }

    if (req.body.speaker !== undefined) {
      updates.speaker = req.body.speaker ? req.body.speaker.trim() : "";
    }

    if (req.body.topic !== undefined) {
      updates.topic = req.body.topic ? req.body.topic.trim() : "";
    }

    if (req.body.location !== undefined) {
      updates.location = req.body.location ? req.body.location.trim() : "";
    }

    // Validate times if updated
    const hasNewStart = req.body.startTime !== undefined;
    const hasNewEnd = req.body.endTime !== undefined;

    let start = existingSchedule.startTime;
    let end = existingSchedule.endTime;

    if (hasNewStart) {
      start = new Date(req.body.startTime);
      if (isNaN(start.getTime())) {
        return res.status(400).json({ error: "Invalid start time format" });
      }
    }

    if (hasNewEnd) {
      end = new Date(req.body.endTime);
      if (isNaN(end.getTime())) {
        return res.status(400).json({ error: "Invalid end time format" });
      }
    }

    if (start >= end) {
      return res.status(400).json({ error: "Start time must be before end time" });
    }

    if (hasNewStart) updates.startTime = start;
    if (hasNewEnd) updates.endTime = end;

    const schedule = await Schedule.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("expo", "title date location status");

    return res.status(200).json({
      success: true,
      msg: "Schedule updated successfully",
      schedule,
    });
  } catch (error) {
    console.error("updateSchedule error:", error);
    return res.status(500).json({ error: error.message || "Failed to update schedule" });
  }
};

// DELETE Schedule
export const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid schedule ID" });
    }

    const schedule = await Schedule.findByIdAndDelete(id);
    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    return res.status(200).json({
      success: true,
      msg: "Schedule deleted successfully",
    });
  } catch (error) {
    console.error("deleteSchedule error:", error);
    return res.status(500).json({ error: error.message || "Failed to delete schedule" });
  }
};