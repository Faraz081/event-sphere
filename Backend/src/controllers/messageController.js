import mongoose from "mongoose";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { notify } from "../utils/notify.js";
import Notification from "../models/Notification.js";

const CHAT_ROLES = ["admin", "exhibitor", "attendee"];

// protect middleware jis naam se bhi id rakhe, wahi utha lo
const getMyId = (req) => String(req.user?.userId ?? req.user?._id ?? req.user?.id ?? req.user?.sub ?? "");

const canMessage = (senderRole, receiverRole) => {
  if (senderRole === "admin" && receiverRole === "exhibitor") return true;
  if (senderRole === "exhibitor" && ["admin", "exhibitor", "attendee"].includes(receiverRole)) return true;
  if (senderRole === "attendee" && receiverRole === "exhibitor") return true;

  return false;
};

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

    const users = await User.find({ _id: { $in: [sender, receiver] } }).select("role name companyName");

    if (users.length !== 2 || users.some((u) => !CHAT_ROLES.includes(u.role))) {
      return res.status(403).json({ error: "Messaging is not available between these users" });
    }

    const senderUser = users.find((u) => String(u._id) === sender);
    const receiverUser = users.find((u) => String(u._id) === String(receiver));

    if (!senderUser || !receiverUser || !canMessage(senderUser.role, receiverUser.role)) {
      return res.status(403).json({ error: "You cannot message this user" });
    }

    const message = await Message.create({ sender, receiver, content: content.trim() });

    // sirf attendee ko notification, har sender ki ek hi (naya message aaye to wahi update hoti hai)
    if (receiverUser.role === "attendee") {
      await notify(receiverUser._id, {
        type: "message",
        title: `New message from ${senderUser.companyName || senderUser.name}`,
        message: content.trim().slice(0, 100),
        link: `/attendee/messages?user=${sender}`,
        dedupeKey: `message:${sender}`,
        refresh: true,
      });
    }

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

    const meUser = await User.findById(me).select("role");

    if (!meUser || !CHAT_ROLES.includes(meUser.role)) {
      return res.status(403).json({ error: "Messaging is not available for this account" });
    }

    let contacts = [];

    if (meUser.role === "admin") {
      contacts = await User.find({
        _id: { $ne: me },
        role: "exhibitor",
      }).select("name role companyName");
    } else if (meUser.role === "exhibitor") {
      const messages = await Message.find({
        $or: [{ sender: me }, { receiver: me }],
      }).select("sender receiver");

      const contactIds = new Set();

      messages.forEach((message) => {
        if (String(message.sender) !== me) {
          contactIds.add(String(message.sender));
        }

        if (String(message.receiver) !== me) {
          contactIds.add(String(message.receiver));
        }
      });

      contacts = await User.find({
        $or: [
          { role: "exhibitor", _id: { $ne: me } },
          { _id: { $in: [...contactIds] } },
          { role: "admin" },
        ],
      }).select("name role companyName");
    } else {
      const messages = await Message.find({
        $or: [{ sender: me }, { receiver: me }],
      }).select("sender receiver");

      const contactIds = new Set();

      messages.forEach((message) => {
        if (String(message.sender) !== me) {
          contactIds.add(String(message.sender));
        }

        if (String(message.receiver) !== me) {
          contactIds.add(String(message.receiver));
        }
      });

      const requestedContactId = req.query.user;
      if (mongoose.isValidObjectId(requestedContactId)) {
        contactIds.add(String(requestedContactId));
      }

      contacts = await User.find({
        _id: { $in: [...contactIds] },
        role: "exhibitor",
      }).select("name role companyName");
    }

    return res.status(200).json({ msg: "Contacts fetched", contacts });
  } catch (error) {
    return res.status(500).json({ error: error.message });
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

    // is sender ki message notification bhi read ho jaye
    await Notification.updateOne({ user: me, dedupeKey: `message:${userId}` }, { isRead: true });

    return res.status(200).json({ msg: "Messages marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { sendMessage, getConversation, getContacts, getUnreadCounts, markAsRead };
