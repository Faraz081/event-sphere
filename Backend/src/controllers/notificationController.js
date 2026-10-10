import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import Attendee from "../models/Attendee.js";
import ExpoBookmark from "../models/ExpoBookmark.js";
import User from "../models/User.js";
import { notify, PROFILE_LINK } from "../utils/notify.js";

const TZ = "Asia/Karachi";

const getMyId = (req) => String(req.user?.userId ?? req.user?._id ?? req.user?.id ?? req.user?.sub ?? "");

// "YYYY-MM-DD" Pakistan ke hisaab se
const dayKey = (d) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(d));

// time sirf tab jab expo ki date mein asli time ho (00:00 nahi)
const timeLabel = (d) => {
  const hm = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(d));
  if (hm === "00:00") return "";
  return ` at ${new Date(d).toLocaleTimeString("en-US", { timeZone: TZ, hour: "numeric", minute: "2-digit" })}`;
};

const generateReminders = async (userId) => {
  const todayKey = dayKey(new Date());
  const tomorrowKey = dayKey(Date.now() + 24 * 60 * 60 * 1000);
  const candidates = [];

  const [eventBookings, expoTickets, expoBookmarks] = await Promise.all([
    Attendee.find({ user: userId, bookingStatus: "confirmed", event: { $ne: null } }).populate("event", "title"),
    Attendee.find({ user: userId, bookingStatus: "confirmed", expo: { $ne: null } }).populate("expo", "title date"),
    ExpoBookmark.find({ user: userId }).populate({ path: "expo", match: { status: "published" }, select: "title date" }),
  ]);

  eventBookings.forEach((b) => {
    if (!b.event || !b.eventDate) return;
    candidates.push({
      id: `booking:${b._id}`,
      date: new Date(b.eventDate).toISOString().slice(0, 10),
      name: b.event.title,
      subject: `Your booking for "${b.event.title}"`,
      time: "",
      link: PROFILE_LINK,
    });
  });

  const ticketedExpoIds = new Set();

  expoTickets.forEach((t) => {
    if (!t.expo?.date) return;
    ticketedExpoIds.add(String(t.expo._id));
    candidates.push({
      id: `ticket:${t._id}`,
      date: dayKey(t.expo.date),
      name: t.expo.title,
      subject: `Your entry pass for "${t.expo.title}"`,
      time: timeLabel(t.expo.date),
      link: PROFILE_LINK,
    });
  });

  expoBookmarks.forEach((bm) => {
    // jis expo ka ticket hai uska reminder upar aa chuka
    if (!bm.expo?.date || ticketedExpoIds.has(String(bm.expo._id))) return;
    candidates.push({
      id: `bookmark:${bm.expo._id}`,
      date: dayKey(bm.expo.date),
      name: bm.expo.title,
      subject: `Bookmarked expo "${bm.expo.title}"`,
      time: timeLabel(bm.expo.date),
      link: `/expos/${bm.expo._id}`,
    });
  });

  await Promise.all(
    candidates.map((c) => {
      const kind = c.date === todayKey ? "today" : c.date === tomorrowKey ? "tomorrow" : null;

      if (!kind) return null;

      return notify(userId, {
        type: "reminder",
        title: `${kind === "today" ? "Today" : "Tomorrow"}: ${c.name}`,
        message: `${c.subject} is ${kind}${c.time}.`,
        link: c.link,
        dedupeKey: `reminder:${c.id}:${c.date}:${kind}`,
      });
    })
  );
};

// GET /notifications
export const getMyNotifications = async (req, res) => {
  try {
    const userId = getMyId(req);

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(401).json({ error: "Please login again" });
    }

    const user = await User.findById(userId).select("role");

    // sirf attendee ke liye
    if (!user || user.role !== "attendee") {
      return res.status(200).json({ notifications: [], unreadCount: 0 });
    }

    await generateReminders(userId);

    const [notifications, unreadCount] = await Promise.all([
        Notification.find({ user: userId }).sort({ updatedAt: -1 }).limit(50),
      Notification.countDocuments({ user: userId, isRead: false }),
    ]);

    return res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /notifications/:id/read
export const markNotificationRead = async (req, res) => {
  try {
    const userId = getMyId(req);
    const { id } = req.params;

    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid request" });
    }

    await Notification.updateOne({ _id: id, user: userId }, { isRead: true });

    return res.status(200).json({ msg: "Marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /notifications/read-all
export const markAllNotificationsRead = async (req, res) => {
  try {
    const userId = getMyId(req);

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(401).json({ error: "Please login again" });
    }

    await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });

    return res.status(200).json({ msg: "All marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};