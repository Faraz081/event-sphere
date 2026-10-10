import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
  type: {type: String, enum: ["booking_approved", "booking_rejected", "ticket_approved", "ticket_rejected", "reminder", "message"], required: true},
  title: {type: String, required: true, trim: true},
  message: {type: String, required: true, trim: true},
  link: {type: String, default: ""},
  isRead: {type: Boolean, default: false},
  dedupeKey: {type: String},
}, { timestamps: true });

notificationSchema.index({ user: 1, createdAt: -1 });
// ek hi reminder dobara na bane
notificationSchema.index({ user: 1, dedupeKey: 1 }, { unique: true, partialFilterExpression: { dedupeKey: { $type: "string" } } });
// 60 din baad purani notifications khud delete
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 24 * 60 * 60 });

export default mongoose.model("Notification", notificationSchema);