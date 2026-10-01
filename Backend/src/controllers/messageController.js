import mongoose from "mongoose";
import Message from "../models/Message.js";
import User from "../models/User.js";

// Login tokens store the account id as `sub`; support the other claim names
// used by older tokens and middleware as well.
const getUserId = (user) =>
  user?.userId || user?.sub || user?.id || user?._id?.toString?.();

const sendMessage = async (req, res) => {
  try {
    const sender = getUserId(req.user);
    const { receiver, content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(sender)) {
      return res.status(401).json({ error: "A valid login is required" });
    }
    if (!receiver || !content?.trim()) {
      return res.status(400).json({ error: "Receiver and content are required" });
    }
    if (!mongoose.Types.ObjectId.isValid(receiver)) {
      return res.status(400).json({ error: "Invalid receiver" });
    }
    if (sender.toString() === receiver.toString()) {
      return res.status(400).json({ error: "You cannot message yourself" });
    }

    const recipient = await User.exists({ _id: receiver, status: "active" });
    if (!recipient) {
      return res.status(404).json({ error: "Active recipient not found" });
    }

    const message = await Message.create({ sender, receiver, content });
    return res.status(201).json({ msg: "Message sent successfully", message });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getConversation = async (req, res) => {
  try {
    const me = getUserId(req.user);
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(me)) {
      return res.status(401).json({ error: "A valid login is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid contact" });
    }

    const messages = await Message.find({
      $or: [
        { sender: me, receiver: userId },
        { sender: userId, receiver: me },
      ],
    }).sort({ createdAt: 1 });
    return res.status(200).json({ msg: "Conversation fetched", messages });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getContacts = async (req, res) => {
  try {
    const me = getUserId(req.user);
    if (!mongoose.Types.ObjectId.isValid(me)) {
      return res.status(401).json({ error: "A valid login is required" });
    }

    const contacts = await User.find({
      _id: { $ne: me },
      status: "active",
    }).select("name role companyName avatar");
    return res.status(200).json({ msg: "Contacts fetched", contacts });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getUnreadCounts = async (req, res) => {
  try {
    const me = getUserId(req.user);
    if (!mongoose.Types.ObjectId.isValid(me)) {
      return res.status(401).json({ error: "A valid login is required" });
    }

    const unread = await Message.aggregate([
      { $match: { receiver: new mongoose.Types.ObjectId(me), read: false } },
      { $group: { _id: "$sender", count: { $sum: 1 } } },
    ]);
    return res.status(200).json({ msg: "Unread counts fetched", unread });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const me = getUserId(req.user);
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(me)) {
      return res.status(401).json({ error: "A valid login is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid contact" });
    }

    await Message.updateMany(
      { sender: userId, receiver: me, read: false },
      { read: true }
    );
    return res.status(200).json({ msg: "Messages marked as read" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export { sendMessage, getConversation, getContacts, getUnreadCounts, markAsRead };
