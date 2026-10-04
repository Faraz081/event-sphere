import mongoose from "mongoose";

const boothSchema = new mongoose.Schema({
    expo: {type: mongoose.Schema.Types.ObjectId, ref: "Expo", required: true},
    boothNumber: {type: String, required: [true, "Booth number is required"], trim: true},
    size: {type: String, trim: true},
    price: {type: Number, default: 0},
    status: {type: String, enum: ["available", "pending", "reserved", "occupied"], default: "available"},
    exhibitor: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    location: {type: String, trim: true},
    products: {type: [String], default: []},
    staff: {type: [{name: {type: String, trim: true}, role: {type: String, trim: true}, _id: false}], default: []}
},{ timestamps: true })
// booth khali ho (admin unassign ya release) to purane products/staff next exhibitor ko na milein
boothSchema.pre("save", function () {
    if (this.isModified("exhibitor") && !this.exhibitor) {
        this.products = [];
        this.staff = [];
    }
});

export default mongoose.model("Booth", boothSchema)