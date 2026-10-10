import mongoose from "mongoose";
import Bookmark from "../models/Bookmark.js";
import ExpoBookmark from "../models/ExpoBookmark.js";
import Event from "../models/Event.js";
import Expo from "../models/Expo.js";
import User from "../models/User.js";

const getMyId = (req) => String(req.user?.userId ?? req.user?._id ?? req.user?.id ?? req.user?.sub ?? "");

// bookmark hai to hata do, nahi hai to laga do
const makeToggle = (BookmarkModel, TargetModel, field, targetFilter, label) => async (req, res) => {
  try {
    const userId = getMyId(req);
    const { id } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(401).json({ error: "Please login again" });
    }

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: `Invalid ${label}` });
    }

    const user = await User.findById(userId).select("role status");

    if (!user || user.role !== "attendee") {
      return res.status(403).json({ error: `Only attendee accounts can bookmark ${label}s` });
    }

    const removed = await BookmarkModel.findOneAndDelete({ user: userId, [field]: id });

    if (removed) return res.status(200).json({ bookmarked: false });

    if (!(await TargetModel.exists({ _id: id, ...targetFilter }))) {
      return res.status(404).json({ error: `${label[0].toUpperCase()}${label.slice(1)} not found` });
    }

    await BookmarkModel.create({ user: userId, [field]: id });

    return res.status(201).json({ bookmarked: true });
  } catch (error) {
    if (error.code === 11000) return res.status(200).json({ bookmarked: true });

    res.status(500).json({ error: error.message });
  }
};

export const toggleBookmark = makeToggle(Bookmark, Event, "event", { status: "approved" }, "event");
export const toggleExpoBookmark = makeToggle(ExpoBookmark, Expo, "expo", { status: "published" }, "expo");

// GET /bookmarks
export const getMyBookmarks = async (req, res) => {
  try {
    const userId = getMyId(req);

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(401).json({ error: "Please login again" });
    }

    const rows = await Bookmark.find({ user: userId })
      .populate({
        path: "event",
        match: { status: "approved" },
        select: "title description location eventType images exhibitor",
        populate: { path: "exhibitor", select: "name" },
      })
      .sort({ createdAt: -1 });

    // delete ya reject ho chuke events (populate ke baad null) nikal do
    const bookmarks = rows.map((row) => row.event).filter(Boolean);

    return res.status(200).json({ bookmarks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /expo-bookmarks
export const getMyExpoBookmarks = async (req, res) => {
  try {
    const userId = getMyId(req);

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(401).json({ error: "Please login again" });
    }

    const rows = await ExpoBookmark.find({ user: userId })
      .populate({
        path: "expo",
        match: { status: "published" },
        select: "title description theme date location banner",
      })
      .sort({ createdAt: -1 });

    const bookmarks = rows.map((row) => row.expo).filter(Boolean);

    return res.status(200).json({ bookmarks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};