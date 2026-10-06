import express from "express";
import { adminAuth, protect } from "../middleware/authMiddleware.js";
import { getExpoTicketRequests, approveExpoTicket, rejectExpoTicket } from "../controllers/adminTicketController.js";

const adminTicketRoute = express.Router();

adminTicketRoute.get("/", protect, adminAuth, getExpoTicketRequests);
adminTicketRoute.put("/:id/approve", protect, adminAuth, approveExpoTicket);
adminTicketRoute.put("/:id/reject", protect, adminAuth, rejectExpoTicket);

export default adminTicketRoute;