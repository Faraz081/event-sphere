import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    expo: {type: mongoose.Schema.Types.ObjectId, ref: "Expo", required: true},
    booth: {type: mongoose.Schema.Types.ObjectId, ref: "Booth", required: true},
    exhibitor: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    title: {type: String, required: [true, "Title is required"], trim: true},
    description: {type: String, required: [true, "Description is required"]},
    date: {type: Date, required: [true, "Date is required"]},
    banner: {type: String}
},{ timestamps: true })

export default mongoose.model("Event", eventSchema)