import "dotenv/config";
import mongoose from "mongoose";
import User from "../src/models/User.js";

const migrateOrganizerRole = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }

  await mongoose.connect(process.env.MONGODB_URI);

  try {
    const result = await User.updateMany(
      { role: "organizer" },
      { $set: { role: "exhibitor" } }
    );

    console.log(`Migrated ${result.modifiedCount} organizer account(s) to exhibitor.`);
  } finally {
    await mongoose.disconnect();
  }
};

migrateOrganizerRole().catch((error) => {
  console.error("Failed to migrate organizer accounts:", error);
  process.exitCode = 1;
});
