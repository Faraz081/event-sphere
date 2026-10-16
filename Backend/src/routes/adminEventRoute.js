import express from "express";
import {
  getAdminEvents,
  getPendingEvents,
  approveEvent,
  rejectEvent,
  deleteAdminEvent,
} from "../controllers/eventController.js";
import { adminAuth } from "../middleware/authMiddleware.js";

const adminEventRoute = express.Router();

adminEventRoute.get("/", adminAuth, getAdminEvents);
adminEventRoute.get("/pending", adminAuth, getPendingEvents);
adminEventRoute.put("/:id/approve", adminAuth, approveEvent);
adminEventRoute.put("/:id/reject", adminAuth, rejectEvent);
adminEventRoute.delete("/:id", adminAuth, deleteAdminEvent);

export default adminEventRoute;