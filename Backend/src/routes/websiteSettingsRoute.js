import express from "express";
import {
  getWebsiteSettings,
  updateWebsiteSettings,
} from "../controllers/websiteSettingsController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const websiteSettingsRoute = express.Router();

// Public: frontend website settings read kar sakta hai
websiteSettingsRoute.get("/", getWebsiteSettings);

// Admin only: settings update kar sakta hai
websiteSettingsRoute.put(
  "/",
  authMiddleware,
  adminMiddleware,
  updateWebsiteSettings
);

export default websiteSettingsRoute;
