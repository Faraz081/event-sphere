import mongoose from "mongoose";
import Message from "../models/Message.js";
import User from "../models/User.js";

const CHAT_ROLES = ["admin", "exhibitor"];

// protect middleware jis naam se bhi id rakhe, wahi utha lo
const getMyId = (req) => String(req.user?.userId ?? req.user?._id ?? req.user?.id ?? req.user?.sub ?? "");

const sendMessage = async (req, res) => {
  try {
    const sender = getMyId(req);
    const { receiver, content } = req.body;
    if (!mongoose.isValidObjectId(sender)) {
      return res.status(401).json({ error: "Please login again" });
    }
    if (!receiver || !content?.trim()) {
      return res.status(400).json({ error: "Receiver and content are required" });
    }
    if (!mongoose.isValidObjectId(receiver)) {
      return res.status(400).json({ error: "Invalid receiver" });
    }
    if (String(receiver) === sender) {
      return res.status(400).json({ error: "You cannot message yourself" });
    }
    const users = await User.find({ _id: { $in: [sender, receiver] } }).select("role");
    if (users.length !== 2 || users.some((u) => !CHAT_ROLES.includes(u.role))) {
      return res.status(403).json({ error: "Messaging is only available between admins and exhibitors" });
    }
    const message = await Message.create({ sender, receiver, content: content.trim() });
    return res.status(201).json({ msg: "Message sent successfully", message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getConversation = async (req, res) => {
  try {
    const me = getMyId(req);
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(me)) {
      return res.status(401).json({ error: "Please login again" });
    }
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: "Invalid user" });
    }
    const messages = await Message.find({
      $or: [
        { sender: me, receiver: userId },
        { sender: userId, receiver: me },
      ],
    }).sort({ createdAt: 1 });
    return res.status(200).json({ msg: "Conversation fetched", messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getContacts = async (req, res) => {
  try {
    const me = getMyId(req);
    if (!mongoose.isValidObjectId(me)) {
      return res.status(401).json({ error: "Please login again" });
    }
    const contacts = await User.find({ _id: { $ne: me }, role: { $in: CHAT_ROLES } }).select("name role companyName");
    return res.status(200).json({ msg: "Contacts fetched", contacts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUnreadCounts = async (req, res) => {
  try {
    const me = getMyId(req);
    if (!mongoose.isValidObjectId(me)) {
      return res.status(401).json({ error: "Please login again" });
    }
    const unread = await Message.aggregate([
      { $match: { receiver: new mongoose.Types.ObjectId(me), read: false } },
      { $group: { _id: "$sender", count: { $sum: 1 } } },
    ]);
    return res.status(200).json({ msg: "Unread counts fetched", unread });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const me = getMyId(req);
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(me)) {
      return res.status(401).json({ error: "Please login again" });
    }
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: "Invalid user" });
    }
    await Message.updateMany({ sender: userId, receiver: me, read: false }, { read: true });
    return res.status(200).json({ msg: "Messages marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { sendMessage, getConversation, getContacts, getUnreadCounts, markAsRead };