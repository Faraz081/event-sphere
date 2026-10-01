import express from 'express'
import { createEvent, getMyEvents, getAllEvents, deleteEvent } from '../controllers/eventController.js';
import { protect } from '../middleware/authMiddleware.js';

const eventRoute = express.Router();
eventRoute.post("/", protect, createEvent)
eventRoute.get("/mine", protect, getMyEvents)
eventRoute.get("/", getAllEvents)
eventRoute.delete("/:id", protect, deleteEvent)

export default eventRoute