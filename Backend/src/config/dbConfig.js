import mongoose from "mongoose";

let connectionPromise = null;

const database = () => {
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    }).then(() => {
      console.log("Database connected");
    }).catch((err) => {
      connectionPromise = null;
      throw err;
    });
  }
  return connectionPromise;
};

export default database;