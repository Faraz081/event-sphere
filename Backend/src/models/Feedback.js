import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    type: {type: String, enum: ["suggestion", "issue", "other"], default: "suggestion"},
    subject: {type: String, trim: true, default: ""},
    message: {type: String, required: [true, "Message is required"], trim: true},
    rating: {type: Number, min: 1, max: 5},
    status: {type: String, enum: ["new", "reviewed", "resolved"], default: "new"},
    adminNote: {type: String, trim: true, default: ""}
},{ timestamps: true })

export default mongoose.model("Feedback", feedbackSchema)