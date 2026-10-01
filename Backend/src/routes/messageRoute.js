import express from 'express'
import { sendMessage, getConversation, getContacts, getUnreadCounts, markAsRead } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const messageRoute = express.Router();
messageRoute.post("/", protect, sendMessage)
messageRoute.get("/contacts", protect, getContacts)
messageRoute.get("/unread", protect, getUnreadCounts)
messageRoute.put("/:userId/read", protect, markAsRead)
messageRoute.get("/:userId", protect, getConversation)

export default messageRoute