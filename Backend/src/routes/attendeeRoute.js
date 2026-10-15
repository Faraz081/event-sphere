import express from "express";
import {
  getAllAttendees,
  getAttendeeById,
  getAttendeeStats,
  checkInAttendee,
  createAttendee,
  updateAttendee,
  deleteAttendee,
} from "../controllers/attendeeController.js";
import { adminAuth } from "../middleware/authMiddleware.js";

const attendeeRoute = express.Router();

attendeeRoute.get("/stats", adminAuth, getAttendeeStats);
attendeeRoute.get("/", adminAuth, getAllAttendees);
attendeeRoute.post("/check-in", adminAuth, checkInAttendee);
attendeeRoute.get("/:id", adminAuth, getAttendeeById);
attendeeRoute.post("/", adminAuth, createAttendee);
attendeeRoute.put("/:id", adminAuth, updateAttendee);
attendeeRoute.delete("/:id", adminAuth, deleteAttendee);

export default attendeeRoute;
