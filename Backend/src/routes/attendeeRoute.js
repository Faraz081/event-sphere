import express from "express";
import {
  getAllAttendees,
  getAttendeeById,
  getAttendeeStats,
  createAttendee,
  updateAttendee,
  deleteAttendee,
} from "../controllers/attendeeController.js";
import { adminAuth } from "../middleware/authMiddleware.js";

const attendeeRoute = express.Router();

// Statistics route must precede the parameterized :id route
attendeeRoute.get("/stats", adminAuth, getAttendeeStats);

// All attendee endpoints are protected for admin access
attendeeRoute.get("/", adminAuth, getAllAttendees);
attendeeRoute.get("/:id", adminAuth, getAttendeeById);
attendeeRoute.post("/", adminAuth, createAttendee);
attendeeRoute.put("/:id", adminAuth, updateAttendee);
attendeeRoute.delete("/:id", adminAuth, deleteAttendee);

export default attendeeRoute;
