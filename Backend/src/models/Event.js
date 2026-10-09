import mongoose from "mongoose";

<<<<<<< HEAD
const eventSchema = new mongoose.Schema({
  exhibitor: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
  title: {type: String, required: [true, "Title is required"], trim: true},
  description: {type: String, required: [true, "Description is required"]},
  location: {type: String, trim: true, default: ""},
  eventType: {type: String, required: [true, "Event type is required"], trim: true},
  images: [{type: String}],
  boothCapacity: {type: Number, required: [true, "Booth capacity is required"], min: [1, "Booth capacity must be at least 1"]},
  banner: {type: String}, 
  status: {type: String, enum: ["pending", "approved", "rejected"], default: "pending"},
  rejectionReason: {type: String, trim: true, default: ""},
  reviewedAt: {type: Date}
},{ timestamps: true })
=======
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
    reviewedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);
>>>>>>> 0935a6b (updated admin tickets, controllers)

export default mongoose.model("Event", eventSchema);