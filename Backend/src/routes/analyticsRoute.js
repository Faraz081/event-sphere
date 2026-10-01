import express from "express";
import { getDashboardAnalytics } from "../controllers/analyticsController.js";
import { adminAuth } from "../middleware/authMiddleware.js";

const analyticsRoute = express.Router();

analyticsRoute.get("/", adminAuth, getDashboardAnalytics);

export default analyticsRoute;