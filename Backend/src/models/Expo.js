import mongoose from "mongoose";

const expoSchema = new mongoose.Schema({
    title: {type: String, required: [true, "Title is required"], trim: true},
    description: {type: String, required: [true, "Description is required"]},
    theme: {type: String, trim: true},
    date: {type: Date, required: [true, "Date is required"]},
    location: {type: String, required: [true, "Location is required"], trim: true},
    status: {type: String, enum: ["draft", "published", "ongoing", "completed", "cancelled"], default: "draft"},
    maxBooths: {type: Number, required: true, min: 1, default: 10},
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    banner: {type: String}
},{ timestamps: true })

expoSchema.statics.updateLifecycleStatuses = async function (now = new Date()) {
    const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setUTCDate(startOfTomorrow.getUTCDate() + 1);

    await Promise.all([
        this.updateMany(
            { status: { $in: ["published", "ongoing"] }, date: { $lt: startOfToday } },
            { $set: { status: "completed" } }
        ),
        this.updateMany(
            { status: { $in: ["published", "ongoing"] }, date: { $gte: startOfToday, $lt: startOfTomorrow } },
            { $set: { status: "ongoing" } }
        ),
        this.updateMany(
            { status: { $in: ["published", "ongoing"] }, date: { $gte: startOfTomorrow } },
            { $set: { status: "published" } }
        ),
    ]);
};

export default mongoose.model("Expo", expoSchema)
