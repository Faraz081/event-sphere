import mongoose from "mongoose";
import User from "../models/User.js";

/**
 * Admin authorization middleware
 * Verifies that the requesting user exists in the database and possesses the 'admin' role.
 * Does not disrupt existing endpoints and checks the DB directly for security.
 */
export const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const xUserId = req.headers["x-user-id"];

    let userId = null;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      userId = authHeader.substring(7).trim();
    } else if (xUserId) {
      userId = xUserId.trim();
    }

    if (!userId) {
      return res.status(401).json({
        error: "Access denied. Authentication required. Please log in with an administrator account.",
      });
    }

    // Validate that the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        error: "Invalid authentication identifier format.",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        error: "User not found. Session expired or account removed.",
      });
    }

    if (user.status === "suspended") {
      return res.status(403).json({
        error: "Your account has been suspended. Please contact support.",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        error: "Forbidden. Administrator privileges are required to access this resource.",
      });
    }

    // Attach verified admin user object to request
    req.user = user;
    next();
  } catch (error) {
    console.error("adminAuth middleware error:", error);
    return res.status(500).json({ error: "Internal authorization error: " + error.message });
  }
};
