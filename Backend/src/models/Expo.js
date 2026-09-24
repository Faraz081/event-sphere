import mongoose from "mongoose";

const expoSchema = new mongoose.Schema({
    title: {type: String, required: [true, "Title is required"], trim: true},
    description: {type: String, required: [true, "Description is required"]},
    theme: {type: String, trim: true},
    date: {type: Date, required: [true, "Date is required"]},
    location: {type: String, required: [true, "Location is required"], trim: true},
    status: {type: String, enum: ["draft", "published", "completed", "cancelled"], default: "draft"},
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    banner: {type: String}
},{ timestamps: true })

export default mongoose.model("Expo", expoSchema)