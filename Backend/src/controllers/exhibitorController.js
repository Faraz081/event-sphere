import User from "../models/User.js";
import Booth from "../models/Booth.js";
import ExhibitorApplication from "../models/ExhibitorApplication.js";
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

// APPROVE exhibitor (old account-level flow)
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

// REJECT exhibitor (old account-level flow)
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

// GET all applications (admin) — filters: status, expo, search
export const getApplications = async (req, res) => {
  try {
    const { status, expo, search } = req.query;

    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (expo && mongoose.Types.ObjectId.isValid(expo)) filter.expo = expo;
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [{ companyName: regex }, { email: regex }, { productsServices: regex }];
    }

    const applications = await ExhibitorApplication.find(filter)
      .populate("userId", "name email phone")
      .populate("expo")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, total: applications.length, applications });
  } catch (error) {
    console.error("getApplications error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch applications" });
  }
};

// APPROVE application
export const approveApplication = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid application ID" });
    }

    const application = await ExhibitorApplication.findByIdAndUpdate(
      id,
      { status: "approved", adminNote: "", reviewedAt: new Date() },
      { new: true }
    );
    if (!application) return res.status(404).json({ error: "Application not found" });

    res.status(200).json({ success: true, msg: "Application approved", application });
  } catch (error) {
    console.error("approveApplication error:", error);
    res.status(500).json({ error: error.message || "Failed to approve application" });
  }
};

// REJECT application (adminNote required)
export const rejectApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid application ID" });
    }
    if (!adminNote || !adminNote.trim()) {
      return res.status(400).json({ error: "Please add a reason for rejection" });
    }

    const application = await ExhibitorApplication.findByIdAndUpdate(
      id,
      { status: "rejected", adminNote: adminNote.trim(), reviewedAt: new Date() },
      { new: true }
    );
    if (!application) return res.status(404).json({ error: "Application not found" });

    res.status(200).json({ success: true, msg: "Application rejected", application });
  } catch (error) {
    console.error("rejectApplication error:", error);
    res.status(500).json({ error: error.message || "Failed to reject application" });
  }
};