import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema({
  name: {type: String, required: [true, "Name is required"], trim: true, maxlength: 100},
  email: { type: String, required: [true, "Email is required"], trim: true,lowercase: true,maxlength: 254},
  phone: {type: String, trim: true, maxlength: 40, default: ""},
  subject: { type: String, trim: true, maxlength: 200, default: ""},
  message: {type: String, required: [true, "Message is required"], trim: true, maxlength: 5000},
  }, { timestamps: true }
);

export default mongoose.model("ContactMessage", contactMessageSchema);