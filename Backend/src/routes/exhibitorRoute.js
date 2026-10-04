import express from "express";
import {
  getExhibitors,
  approveExhibitor,
  rejectExhibitor,
  getApplications,
  approveApplication,
  rejectApplication,
} from "../controllers/exhibitorController.js";
import { adminAuth } from "../middleware/authMiddleware.js";

const exhibitorRoute = express.Router();

exhibitorRoute.get("/", adminAuth, getExhibitors);
exhibitorRoute.get("/applications", adminAuth, getApplications);
exhibitorRoute.put("/applications/:id/approve", adminAuth, approveApplication);
exhibitorRoute.put("/applications/:id/reject", adminAuth, rejectApplication);
exhibitorRoute.put("/:id/approve", adminAuth, approveExhibitor);
exhibitorRoute.put("/:id/reject", adminAuth, rejectExhibitor);

export default exhibitorRoute;