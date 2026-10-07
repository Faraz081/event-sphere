import mongoose from "mongoose";
import Event from "../models/Event.js";

const getPendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "pending" })
      .populate("exhibitor", "name email companyName")
      .sort({ createdAt: -1 });

    return res.status(200).json({ msg: "Pending events fetched", events });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const approveEvent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }

    const event = await Event.findByIdAndUpdate(
      id,
      {
        status: "approved",
        reviewedAt: new Date(),
        rejectionReason: ""
      },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    return res.status(200).json({
      msg: "Event approved successfully",
      event
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const rejectEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }

    if (!reason?.trim()) {
      return res.status(400).json({ error: "Rejection reason is required" });
    }

    const event = await Event.findByIdAndUpdate(
      id,
      {
        status: "rejected",
        reviewedAt: new Date(),
        rejectionReason: reason.trim()
      },
      { new: true }
    );

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    return res.status(200).json({
      msg: "Event rejected successfully",
      event
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { getPendingEvents, approveEvent, rejectEvent };