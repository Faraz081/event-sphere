import express from "express";
import { adminAuth, protect } from "../middleware/authMiddleware.js";
import {
  getExpoTicketRequests,
  approveExpoTicket,
  rejectExpoTicket,
  cancelExpoTicket,
} from "../controllers/adminTicketController.js";

const adminTicketRoute = express.Router();

adminTicketRoute.get("/", protect, adminAuth, getExpoTicketRequests);
adminTicketRoute.put("/:id/approve", protect, adminAuth, approveExpoTicket);
adminTicketRoute.put("/:id/reject", protect, adminAuth, rejectExpoTicket);
adminTicketRoute.put("/:id/cancel", protect, adminAuth, cancelExpoTicket);

export default adminTicketRoute;