import Schedule from "../models/Schedule.js";
import Expo from "../models/Expo.js";
import mongoose from "mongoose";

const MAX_EXPO_SCHEDULE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_SESSION_DURATION_MS = 48 * 60 * 60 * 1000;

const getScheduleTimeError = (start, end, expoDate) => {
  if (start < new Date()) return "Cannot schedule in the past";
  if (start < expoDate) return "Session cannot start before the selected Expo begins";
  if (start >= end) return "Start time must be before end time";
  if (end - start > MAX_SESSION_DURATION_MS) {
    return "A session cannot last longer than 48 hours";
  }
  if (end > new Date(expoDate.getTime() + MAX_EXPO_SCHEDULE_WINDOW_MS)) {
    return "Session must finish within 30 days of the Expo start";
  }
  return null;
};

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

    if (!mongoose.Types.ObjectId.isValid(targetExpoId)) {
      return res.status(400).json({ error: "Invalid expo ID" });
    }

    const expoExists = await Expo.findById(targetExpoId);
    if (!expoExists) {
      return res.status(404).json({ error: "Selected expo does not exist" });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime())) {
      return res.status(400).json({ error: "Invalid start time format" });
    }
    if (isNaN(end.getTime())) {
      return res.status(400).json({ error: "Invalid end time format" });
    }

    const expoDate = new Date(expoExists.date);
    const timingError = getScheduleTimeError(start, end, expoDate);
    if (timingError) {
      return res.status(400).json({ error: timingError });
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
      addSchedule: schedule, 
    });
  } catch (error) {
    console.error("createSchedule error:", error);
    return res.status(500).json({ error: error.message || "Failed to create schedule" });
  }
};

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
      .sort({ startTime: 1 }); 

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

    const requestedExpoId = req.body.expo ?? req.body.expoId;
    const targetExpoId = requestedExpoId ?? existingSchedule.expo;
    if (!mongoose.Types.ObjectId.isValid(targetExpoId)) {
      return res.status(400).json({ error: "Invalid expo ID" });
    }
    const targetExpo = await Expo.findById(targetExpoId);
    if (!targetExpo) {
      return res.status(404).json({ error: "Selected expo does not exist" });
    }
    if (requestedExpoId !== undefined) updates.expo = targetExpo._id;

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

    const hasNewStart = req.body.startTime !== undefined;
    const hasNewEnd = req.body.endTime !== undefined;

    let start = existingSchedule.startTime;
    let end = existingSchedule.endTime;

    if (hasNewStart) {
      start = new Date(req.body.startTime);
      if (isNaN(start.getTime())) {
        return res.status(400).json({ error: "Invalid start time format" });
      }
      if (start < new Date()) {
        return res.status(400).json({ error: "Cannot schedule in the past" });
      }
    }

    if (hasNewEnd) {
      end = new Date(req.body.endTime);
      if (isNaN(end.getTime())) {
        return res.status(400).json({ error: "Invalid end time format" });
      }
    }

    if (hasNewStart || hasNewEnd || requestedExpoId !== undefined) {
      const timingError = getScheduleTimeError(start, end, new Date(targetExpo.date));
      if (timingError) {
        return res.status(400).json({ error: timingError });
      }
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
