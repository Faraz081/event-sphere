import jwt from "jsonwebtoken";
import User from "../models/User.js";

const identifyUser = async (req, res, next) => {
  try {
    const header = req.headers.authorization ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Please login first" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.sub);
    if (!user) return res.status(401).json({ error: "User not found" });
    if (user.role !== "exhibitor") return res.status(403).json({ error: "Only exhibitors can access this" });
    if (user.status !== "active") return res.status(403).json({ error: "This account is not active" });

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export default identifyUser;