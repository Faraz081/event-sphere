import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Admin authorization middleware
 * Verifies that the requesting user exists in the database and possesses the 'admin' role.
 * Does not disrupt existing endpoints and checks the DB directly for security.
 */
export const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Access denied. A valid bearer token is required.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured");
      return res.status(500).json({ error: "Authentication is not configured." });
    }

    let payload;
    try {
      payload = jwt.verify(authHeader.slice(7).trim(), process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({
        error: "Invalid or expired authentication token.",
      });
    }

    const userId = payload?.sub || payload?.id || payload?._id;
    if (!userId) {
      return res.status(401).json({ error: "Invalid authentication token." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        error: "User not found. Session expired or account removed.",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        error: "Your account is not active. Please contact support.",
      });
    }

    if (user.role !== "admin" || payload.role !== user.role) {
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
