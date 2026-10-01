import express from "express";
import {
  getExhibitors,
  approveExhibitor,
  rejectExhibitor,
} from "../controllers/exhibitorController.js";
import { adminAuth } from "../middleware/authMiddleware.js";

const exhibitorRoute = express.Router();

exhibitorRoute.get("/", adminAuth, getExhibitors);
exhibitorRoute.put("/:id/approve", adminAuth, approveExhibitor);
exhibitorRoute.put("/:id/reject", adminAuth, rejectExhibitor);

export default exhibitorRoute;