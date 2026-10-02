import User from "../models/User.js";

const identifyUser = async (req, res, next) => {
  try {
    const userId = req.headers["x-user-id"];

    if (!userId) {
      return res.status(401).json({ error: "Please login first" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (user.role !== "exhibitor") {
      return res.status(403).json({ error: "Only exhibitors can access this" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid user" });
  }
};

export default identifyUser;