import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import identifyUser from "../middleware/identifyUser.js";
import { bookEvent, getMyRegistrations, getBookingRequests, approveBooking, rejectBooking, bookExpoTicket } from "../controllers/attendeeSelfController.js";

const attendeeSelfRoute = express.Router();

// attendee
attendeeSelfRoute.post("/book", protect, bookEvent);
attendeeSelfRoute.get("/my", protect, getMyRegistrations);

// exhibitor
attendeeSelfRoute.get("/requests", identifyUser, getBookingRequests);
attendeeSelfRoute.put("/requests/:id/approve", identifyUser, approveBooking);
attendeeSelfRoute.put("/requests/:id/reject", identifyUser, rejectBooking);
attendeeSelfRoute.post("/book-expo", protect, bookExpoTicket);

export default attendeeSelfRoute;