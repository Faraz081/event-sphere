import Notification from "../models/Notification.js";

// attendee profile page ka route
export const PROFILE_LINK = "/profile";

// dedupeKey + refresh: wahi notification dobara unread hoke naye text ke saath update ho jati hai
export const notify = async (userId, { type, title, message, link = "", dedupeKey, refresh = false }) => {
  try {
    if (dedupeKey && refresh) {
      await Notification.updateOne(
        { user: userId, dedupeKey },
        { $set: { type, title, message, link, isRead: false } },
        { upsert: true }
      );
      return;
    }

    if (dedupeKey) {
      await Notification.updateOne(
        { user: userId, dedupeKey },
        { $setOnInsert: { user: userId, type, title, message, link, dedupeKey } },
        { upsert: true }
      );
      return;
    }

    await Notification.create({ user: userId, type, title, message, link });
  } catch (error) {
    console.error("notify failed:", error.message);
  }
};