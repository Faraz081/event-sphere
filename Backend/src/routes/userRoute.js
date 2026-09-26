import express from "express";
import {
  getAllUsers,
  getUserStats,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { adminAuth } from "../middleware/authMiddleware.js";

const userRoute = express.Router();

// Statistics endpoint must precede parameterized :id route
userRoute.get("/stats", adminAuth, getUserStats);

// List and Create
userRoute.get("/", adminAuth, getAllUsers);
userRoute.post("/", adminAuth, createUser);

// Single User Operations
userRoute.get("/:id", adminAuth, getUserById);
userRoute.put("/:id", adminAuth, updateUser);
userRoute.delete("/:id", adminAuth, deleteUser);

export default userRoute;
