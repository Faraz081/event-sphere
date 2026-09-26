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
    registrationEventKey: { type: String, select: false },
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
    // Legacy records remain outside unique indexes until safely validated by the API.
    uniqueKeysEnforced: { type: Boolean, default: false, select: false },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

attendeeSchema.index(
  { user: 1, expo: 1 },
  { unique: true, partialFilterExpression: { uniqueKeysEnforced: true, expo: { $type: "objectId" } } }
);
attendeeSchema.index(
  { user: 1, registrationEventKey: 1 },
  { unique: true, partialFilterExpression: { uniqueKeysEnforced: true, registrationEventKey: { $type: "string" } } }
);
attendeeSchema.index(
  { passCode: 1 },
  { unique: true, partialFilterExpression: { uniqueKeysEnforced: true, passCode: { $type: "string", $gt: "" } } }
);

export default mongoose.model("Attendee", attendeeSchema);
