import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/User.js";

const VALID_ROLES = ["admin", "organizer", "attendee", "exhibitor"];
const VALID_STATUSES = ["active", "inactive", "suspended"];

export const getAllUsers = async (req, res) => {
  try {
    const { search, role, status, sortBy = "createdAt", sortOrder = "desc" } = req.query;

    const filter = { role: { $ne: "admin" } };

    if (role && role !== "all" && role !== "admin") {
      if (VALID_ROLES.includes(role)) {
        filter.role = role;
      }
    }

    if (status && status !== "all") {
      if (VALID_STATUSES.includes(status)) {
        filter.status = status;
      }
    }

    if (search && search.trim() !== "") {
      const cleanSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(cleanSearch, "i");
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { companyName: searchRegex },
      ];
    }

    const sortOption = {};
    sortOption[sortBy] = sortOrder === "asc" ? 1 : -1;

    const users = await User.find(filter)
      .select("-password")
      .sort(sortOption);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      total,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: error.message || "Failed to fetch users" });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const [
      total,
      organizers,
      attendees,
      exhibitors,
      active,
      inactive,
      suspended,
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: "admin" } }),
      User.countDocuments({ role: "organizer" }),
      User.countDocuments({ role: "attendee" }),
      User.countDocuments({ role: "exhibitor" }),
      User.countDocuments({ status: "active", role: { $ne: "admin" } }),
      User.countDocuments({ status: "inactive", role: { $ne: "admin" } }),
      User.countDocuments({ status: "suspended", role: { $ne: "admin" } }),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total,
        organizers,
        attendees,
        exhibitors,
        active,
        inactive,
        suspended,
      },
    });
  } catch (error) {
    console.error("Error fetching user statistics:", error);
    res.status(500).json({ error: error.message || "Failed to fetch user statistics" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ error: error.message || "Failed to fetch user details" });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, status = "active", phone, companyName } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Name, email, password, and role are required." });
    }

    if (role === "admin") {
      return res.status(403).json({ error: "Admin accounts cannot be created from this panel." });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` });
    }

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(409).json({ error: "A user with this email address already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      status: status || "active",
      phone: phone ? phone.trim() : undefined,
      companyName: companyName ? companyName.trim() : undefined,
    });

    const userObj = newUser.toObject();
    delete userObj.password;

    res.status(201).json({
      success: true,
      msg: "User created successfully",
      user: userObj,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: error.message || "Failed to create user" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, status, phone, companyName } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    const user = await User.findById(id).select("+password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(403).json({ error: "Admin account cannot be modified from this panel." });
    }

    if (email && email.toLowerCase().trim() !== user.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: "Please enter a valid email address." });
      }
      const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
      if (existingUser && existingUser._id.toString() !== id) {
        return res.status(409).json({ error: "This email address is already in use by another account." });
      }
      user.email = email.toLowerCase().trim();
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone ? phone.trim() : "";
    if (companyName !== undefined) user.companyName = companyName ? companyName.trim() : "";

    if (role) {
      if (role === "admin") {
        return res.status(403).json({ error: "Cannot assign admin role." });
      }
      if (!VALID_ROLES.includes(role)) {
        return res.status(400).json({ error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` });
      }
      user.role = role;
    }

    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` });
      }
      user.status = status;
    }

    if (password && password.trim() !== "") {
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long." });
      }
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    const updatedUser = user.toObject();
    delete updatedUser.password;

    res.status(200).json({
      success: true,
      msg: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: error.message || "Failed to update user" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid user ID format" });
    }

    if (req.user && req.user._id.toString() === id) {
      return res.status(400).json({
        error: "Action prohibited. You cannot delete your currently authenticated administrator account.",
      });
    }

    const target = await User.findById(id);
    if (!target) {
      return res.status(404).json({ error: "User not found" });
    }

    if (target.role === "admin") {
      return res.status(403).json({ error: "Admin account cannot be deleted." });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      msg: `User "${target.name}" deleted successfully.`,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: error.message || "Failed to delete user" });
  }
};