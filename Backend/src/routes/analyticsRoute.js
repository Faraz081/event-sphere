import express from "express";
import { getDashboardAnalytics, getExpoReport } from "../controllers/analyticsController.js";
import { adminAuth } from "../middleware/authMiddleware.js";

const analyticsRoute = express.Router();

analyticsRoute.get("/", adminAuth, getDashboardAnalytics);
analyticsRoute.get("/expo/:expoId", adminAuth, getExpoReport);

export default analyticsRoute;