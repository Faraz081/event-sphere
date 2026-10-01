import express from "express";
import {
  createExpo,
  getAllExpos,
  getExpoById,
  updateExpo,
  deleteExpo,
} from "../controllers/expoController.js";
import { adminAuth } from "../middleware/authMiddleware.js";

const expoRoute = express.Router();

expoRoute.get("/", adminAuth, getAllExpos);
expoRoute.post("/", adminAuth, createExpo);
expoRoute.get("/:id", adminAuth, getExpoById);
expoRoute.put("/:id", adminAuth, updateExpo);
expoRoute.delete("/:id", adminAuth, deleteExpo);

export default expoRoute;