import express from "express";
import { adminAuth } from "../middleware/authMiddleware.js";
import {
  createContactMessage,
  getContactMessages,
} from "../controllers/contactController.js";

const contactRoute = express.Router();

contactRoute.post("/", createContactMessage);
contactRoute.get("/", adminAuth, getContactMessages);

export default contactRoute;
