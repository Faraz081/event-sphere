import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import identifyUser from "../middleware/identifyUser.js";
import { bookEvent, getMyRegistrations, getBookingRequests, approveBooking, rejectBooking, bookExpoTicket } from "../controllers/attendeeSelfController.js";
import { toggleBookmark, toggleExpoBookmark, getMyBookmarks, getMyExpoBookmarks } from "../controllers/bookmarkController.js";
import { getMyNotifications, markNotificationRead, markAllNotificationsRead } from "../controllers/notificationController.js";

const attendeeSelfRoute = express.Router();

// attendee
attendeeSelfRoute.post("/book", protect, bookEvent);
attendeeSelfRoute.get("/my", protect, getMyRegistrations);
attendeeSelfRoute.post("/book-expo", protect, bookExpoTicket);
attendeeSelfRoute.get("/bookmarks", protect, getMyBookmarks);
attendeeSelfRoute.post("/bookmarks/:id", protect, toggleBookmark);
attendeeSelfRoute.get("/expo-bookmarks", protect, getMyExpoBookmarks);
attendeeSelfRoute.post("/expo-bookmarks/:id", protect, toggleExpoBookmark);

// exhibitor
attendeeSelfRoute.get("/requests", identifyUser, getBookingRequests);
attendeeSelfRoute.put("/requests/:id/approve", identifyUser, approveBooking);
attendeeSelfRoute.put("/requests/:id/reject", identifyUser, rejectBooking);

attendeeSelfRoute.get("/notifications", protect, getMyNotifications);
attendeeSelfRoute.put("/notifications/read-all", protect, markAllNotificationsRead);
attendeeSelfRoute.put("/notifications/:id/read", protect, markNotificationRead);

export default attendeeSelfRoute;