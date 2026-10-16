import express from "express";
import {
  getWebsiteSettings,
  updateWebsiteSettings,
} from "../controllers/websiteSettingsController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const websiteSettingsRoute = express.Router();

websiteSettingsRoute.get("/", getWebsiteSettings);

websiteSettingsRoute.put(
  "/",
  authMiddleware,
  adminMiddleware,
  updateWebsiteSettings
);

export default websiteSettingsRoute;
