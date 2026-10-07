import express from "express";
import { getPendingEvents, approveEvent, rejectEvent } from "../controllers/adminEventController.js";
import { adminAuth } from "../middleware/authMiddleware.js";

const adminEventRoute = express.Router();

adminEventRoute.get("/pending", adminAuth, getPendingEvents);
adminEventRoute.put("/:id/approve", adminAuth, approveEvent);
adminEventRoute.put("/:id/reject", adminAuth, rejectEvent);

export default adminEventRoute;