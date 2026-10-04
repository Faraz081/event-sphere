import express from "express";
import { protect, adminAuth } from "../middleware/authMiddleware.js";
import { createFeedback, getAllFeedback, updateFeedback } from "../controllers/feedbackController.js";

const feedbackRoute = express.Router();

feedbackRoute.post("/", protect, createFeedback);
feedbackRoute.get("/", adminAuth, getAllFeedback);
feedbackRoute.put("/:id", adminAuth, updateFeedback);

export default feedbackRoute;