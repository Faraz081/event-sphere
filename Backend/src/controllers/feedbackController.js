import mongoose from "mongoose";
import Feedback from "../models/Feedback.js";
import Expo from "../models/Expo.js";

const TYPES = ["suggestion", "issue", "other"];
const STATUSES = ["new", "reviewed", "resolved"];

// protect middleware jis naam se bhi id rakhe, wahi utha lo
const getMyId = (req) => String(req.user?.userId ?? req.user?._id ?? req.user?.id ?? req.user?.sub ?? "");

// POST /  (koi bhi logged-in user)
export const createFeedback = async (req, res) => {
  try {
    const userId = getMyId(req);
    if (!mongoose.isValidObjectId(userId)) return res.status(401).json({ error: "Please login again" });

    const { type = "suggestion", subject, message, rating, expo } = req.body;

    if (!TYPES.includes(type)) return res.status(400).json({ error: "Invalid feedback type" });
    if (!message?.trim() || message.trim().length < 10) {
      return res.status(400).json({ error: "Please write at least 10 characters" });
    }
    if (message.trim().length > 2000) return res.status(400).json({ error: "Message is too long (max 2000 characters)" });

    let expoId;
    if (expo) {
      if (!mongoose.isValidObjectId(expo)) return res.status(400).json({ error: "Invalid expo" });
      const existingExpo = await Expo.exists({ _id: expo, status: "published" });
      if (!existingExpo) return res.status(400).json({ error: "Please select an available expo" });
      expoId = expo;
    }

    let parsedRating;
    if (rating !== undefined && rating !== null && rating !== "") {
      parsedRating = Number(rating);
      if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
      }
    }

    const feedback = await Feedback.create({
      user: userId,
      expo: expoId,
      type,
      subject: subject?.trim().slice(0, 120) ?? "",
      message: message.trim(),
      rating: parsedRating,
    });

    return res.status(201).json({ msg: "Thank you for your feedback", feedback });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /  (admin)
export const getAllFeedback = async (req, res) => {
  try {
    const { status, type, search } = req.query;
    const filter = {};
    if (status && status !== "all" && STATUSES.includes(status)) filter.status = status;
    if (type && type !== "all" && TYPES.includes(type)) filter.type = type;
    if (search?.trim()) {
      const re = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ subject: re }, { message: re }];
    }

    const [feedback, newCount] = await Promise.all([
      Feedback.find(filter).populate("user", "name email role").populate("expo", "title").sort({ createdAt: -1 }),
      Feedback.countDocuments({ status: "new" }),
    ]);

    return res.status(200).json({ total: feedback.length, newCount, feedback });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /:id  (admin)  { status, adminNote }
export const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ error: "Invalid feedback ID" });

    const updates = {};
    if (req.body.status !== undefined) {
      if (!STATUSES.includes(req.body.status)) return res.status(400).json({ error: "Invalid status" });
      updates.status = req.body.status;
    }
    if (req.body.adminNote !== undefined) updates.adminNote = String(req.body.adminNote).trim().slice(0, 1000);

    const feedback = await Feedback.findByIdAndUpdate(id, { $set: updates }, { new: true }).populate("user", "name email role").populate("expo", "title");
    if (!feedback) return res.status(404).json({ error: "Feedback not found" });

    return res.status(200).json({ msg: "Feedback updated", feedback });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
