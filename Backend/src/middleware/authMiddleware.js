import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        msg: "Authentication required",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        msg: "Authentication is not configured",
      });
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      return res.status(401).json({
        msg: "Authentication required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      msg: "Invalid or expired token",
    });
  }
};

export default authMiddleware;
export const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Authentication required",
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
        error: "Invalid or expired token",
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
        error: "Administrator privileges are required to access this resource.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("adminAuth middleware error:", error);
    return res.status(500).json({
      error: "Internal authorization error: " + error.message,
    });
  }
};
