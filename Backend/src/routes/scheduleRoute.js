import express from "express";
import {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
} from "../controllers/scheduleController.js";
import { adminAuth } from "../middleware/authMiddleware.js";

const scheduleRoute = express.Router();

scheduleRoute.get("/", adminAuth, getAllSchedules);
scheduleRoute.post("/", adminAuth, createSchedule);
scheduleRoute.get("/:id", adminAuth, getScheduleById);
scheduleRoute.put("/:id", adminAuth, updateSchedule);
scheduleRoute.delete("/:id", adminAuth, deleteSchedule);

export default scheduleRoute;