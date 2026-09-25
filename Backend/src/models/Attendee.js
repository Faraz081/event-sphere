import mongoose from "mongoose";

const attendeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User association is required"],
    },
    expo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expo",
    },
    eventName: {
      type: String,
      trim: true,
    },
    registrationStatus: {
      type: String,
      enum: ["registered", "confirmed", "attended", "cancelled"],
      default: "registered",
      required: true,
    },
    bookingStatus: {
      type: String,
      enum: ["confirmed", "pending", "cancelled"],
      default: "confirmed",
      required: true,
    },
    passStatus: {
      type: String,
      enum: ["issued", "claimed", "scanned", "revoked"],
      default: "issued",
      required: true,
    },
    ticketType: {
      type: String,
      default: "Standard Pass",
      trim: true,
    },
    passCode: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Attendee", attendeeSchema);
