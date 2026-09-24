import mongoose from "mongoose";

const boothSchema = new mongoose.Schema({
    expo: {type: mongoose.Schema.Types.ObjectId, ref: "Expo", required: true},
    boothNumber: {type: String, required: [true, "Booth number is required"], trim: true},
    size: {type: String, trim: true},
    price: {type: Number, default: 0},
    status: {type: String, enum: ["available", "reserved", "occupied"], default: "available"},
    exhibitor: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    location: {type: String, trim: true}
},{ timestamps: true })

export default mongoose.model("Booth", boothSchema)