import mongoose from "mongoose";

let cachedConnection = null;

const connectDB = () => {
  if (cachedConnection) {
    return cachedConnection;
  }

  cachedConnection = mongoose.connect(process.env.MONGODB_URI, {serverSelectionTimeoutMS: 8000}).then(() => {
      console.log("Database connected");
    }) .catch((error) => {
      cachedConnection = null;
      throw error;
    });

  return cachedConnection;
};

export default connectDB;