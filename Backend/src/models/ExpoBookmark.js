import mongoose from "mongoose";

const expoBookmarkSchema = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
  expo: {type: mongoose.Schema.Types.ObjectId, ref: "Expo", required: true},
}, { timestamps: true });

expoBookmarkSchema.index({ user: 1, expo: 1 }, { unique: true });

export default mongoose.model("ExpoBookmark", expoBookmarkSchema);