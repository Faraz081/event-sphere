import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {type: String, required: true, lowercase: true, trim: true},
  otp: {type: String, required: true},
  createdAt: {type: Date, default: Date.now},
});

otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

export default mongoose.model("Otp", otpSchema);