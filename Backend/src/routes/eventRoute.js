import express from "express";
import {
  createEvent,
  getMyEvents,
  getAllEvents,
  getPendingEvents,
  getAdminEvents,
  approveEvent,
  rejectEvent,
  deleteEvent,
  updateEvent,
} from "../controllers/eventController.js";
import { protect, adminAuth } from "../middleware/authMiddleware.js";

const eventRoute = express.Router();

eventRoute.post("/", protect, createEvent);
eventRoute.get("/mine", protect, getMyEvents);
eventRoute.get("/", getAllEvents);

eventRoute.get("/admin/all", protect, adminAuth, getAdminEvents);
eventRoute.get("/admin/pending", protect, adminAuth, getPendingEvents);
eventRoute.put("/admin/:id/approve", protect, adminAuth, approveEvent);
eventRoute.put("/admin/:id/reject", protect, adminAuth, rejectEvent);

eventRoute.put("/:id", protect, updateEvent);
eventRoute.delete("/:id", protect, deleteEvent);

export default eventRoute;