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
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
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
  enum: ["pending", "issued", "claimed", "scanned", "revoked"],
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
    // exhibitor ki taraf se approve/reject ki wajah
    decisionNote: {
      type: String,
      trim: true,
      default: "",
    },
eventDate: { type: Date },
stalls: [{type: mongoose.Schema.Types.ObjectId}],
stallNumbers: [{type: String}],
contactName: {type: String, trim: true},
guests: { type: Number, min: 1 },
contactPhone: { type: String, trim: true },
    entryPassId: { type: String },
reviewedAt: { type: Date },
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
attendeeSchema.index(
  { entryPassId: 1 },
  { unique: true, partialFilterExpression: { entryPassId: { $type: "string" } } }
);

export default mongoose.model("Attendee", attendeeSchema);