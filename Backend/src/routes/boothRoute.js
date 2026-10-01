import express from "express";
import {
  createBooth,
  getAllBooths,
  getBoothById,
  updateBooth,
  deleteBooth,
} from "../controllers/boothController.js";
import { adminAuth } from "../middleware/authMiddleware.js";

const boothRoute = express.Router();

// All booth routes protected (Admin only)
boothRoute.get("/", adminAuth, getAllBooths);
boothRoute.post("/", adminAuth, createBooth);
boothRoute.get("/:id", adminAuth, getBoothById);
boothRoute.put("/:id", adminAuth, updateBooth);
boothRoute.delete("/:id", adminAuth, deleteBooth);

export default boothRoute;