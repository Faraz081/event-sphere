import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
    expo: {type: mongoose.Schema.Types.ObjectId, ref: "Expo", required: true},
    title: {type: String, required: [true, "Title is required"], trim: true},
    speaker: {type: String, trim: true},
    topic: {type: String, trim: true},
    location: {type: String, trim: true},
    startTime: {type: Date, required: [true, "Start time is required"]},
    endTime: {type: Date, required: [true, "End time is required"]}
},{ timestamps: true })

export default mongoose.model("Schedule", scheduleSchema)