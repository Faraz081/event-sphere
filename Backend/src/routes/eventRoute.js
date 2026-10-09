import express from 'express'
import { createEvent, getMyEvents, getAllEvents, deleteEvent, updateEvent } from '../controllers/eventController.js';
import { protect } from '../middleware/authMiddleware.js';
import { addStall, deleteStall, updateStall } from '../controllers/eventStallController.js';

const eventRoute = express.Router();
eventRoute.post("/", protect, createEvent)
eventRoute.get("/mine", protect, getMyEvents)
eventRoute.get("/", getAllEvents)
eventRoute.delete("/:id", protect, deleteEvent)
eventRoute.put("/:id", protect,  updateEvent);

eventRoute.post("/:id/stalls", protect, addStall);
eventRoute.put("/:id/stalls/:stallId", protect, updateStall);
eventRoute.delete("/:id/stalls/:stallId", protect, deleteStall);

export default eventRoute