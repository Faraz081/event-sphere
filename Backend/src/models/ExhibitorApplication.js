import mongoose from "mongoose";
const exhibitorApplicationSchema = new mongoose.Schema(
  { userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    companyName: { type: String, required: true, trim: true },
    productsServices: { type: String, required: true },
    description: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    address: { type: String, default: "" },
    logo: { type: String, default: "" },
    documents: { type: [String], default: [] },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

const ExhibitorApplication = mongoose.model("ExhibitorApplication", exhibitorApplicationSchema);

export default ExhibitorApplication;