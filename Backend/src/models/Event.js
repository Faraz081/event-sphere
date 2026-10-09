import mongoose from "mongoose";

const stallSchema = new mongoose.Schema({
  stallNumber: {type: String, required: true, trim: true},
  name: {type: String, trim: true, default: ""},
  size: {type: String, trim: true, default: ""},
  description: {type: String, trim: true, default: ""},
});

const eventSchema = new mongoose.Schema({
  exhibitor: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
  title: {type: String, required: [true, "Title is required"], trim: true},
  description: {type: String, required: [true, "Description is required"]},
  location: {type: String, trim: true, default: ""},
  eventType: {type: String, required: [true, "Event type is required"], trim: true},
  images: [{type: String}],
  boothCapacity: {type: Number, required: [true, "Booth capacity is required"], min: [1, "Booth capacity must be at least 1"]},
  stalls: { type: [stallSchema], default: [] },
  banner: {type: String}, 
  status: {type: String, enum: ["pending", "approved", "rejected"], default: "pending"},
  rejectionReason: {type: String, trim: true, default: ""},
  reviewedAt: {type: Date}
},{ timestamps: true })

export default mongoose.model("Event", eventSchema)