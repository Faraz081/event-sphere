import User from "../models/User.js";
import Booth from "../models/Booth.js";
import mongoose from "mongoose";

// GET all exhibitors (with filter)
export const getExhibitors = async (req, res) => {
  try {
    const { exhibitorStatus, search } = req.query;

    const filter = { role: "exhibitor" };

    if (exhibitorStatus && exhibitorStatus !== "all") {
      filter.exhibitorStatus = exhibitorStatus;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { name: regex },
        { email: regex },
        { companyName: regex },
        { phone: regex },
      ];
    }

    const exhibitors = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      total: exhibitors.length,
      exhibitors,
    });
  } catch (error) {
    console.error("getExhibitors error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch exhibitors" });
  }
};

// APPROVE exhibitor
export const approveExhibitor = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid exhibitor ID" });
    }

    const user = await User.findOne({ _id: id, role: "exhibitor" });
    if (!user) {
      return res.status(404).json({ error: "Exhibitor not found" });
    }

    user.exhibitorStatus = "approved";
    user.status = "active";
    await user.save();

    res.status(200).json({
      success: true,
      msg: "Exhibitor approved successfully",
      exhibitor: user,
    });
  } catch (error) {
    console.error("approveExhibitor error:", error);
    res.status(500).json({ error: error.message || "Failed to approve exhibitor" });
  }
};

// REJECT exhibitor
export const rejectExhibitor = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid exhibitor ID" });
    }

    const user = await User.findOne({ _id: id, role: "exhibitor" });
    if (!user) {
      return res.status(404).json({ error: "Exhibitor not found" });
    }

    user.exhibitorStatus = "rejected";
    user.status = "suspended";
    await user.save();

    // Agar is exhibitor ko koi booth assigned hai to unassign kar do
    await Booth.updateMany(
      { exhibitor: id },
      { $set: { exhibitor: null, status: "available" } }
    );

    res.status(200).json({
      success: true,
      msg: "Exhibitor rejected successfully",
      exhibitor: user,
    });
  } catch (error) {
    console.error("rejectExhibitor error:", error);
    res.status(500).json({ error: error.message || "Failed to reject exhibitor" });
  }
};