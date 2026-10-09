import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    expo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expo",
      required: true,
    },
    exhibitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    eventType: {
      type: String,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    boothCapacity: {
      type: Number,
      min: 1,
    },
    banner: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNote: {
      type: String,
      default: "",
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);