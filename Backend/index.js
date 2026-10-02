import express from "express";
import "dotenv/config";
import cors from "cors";
import database from "./src/config/dbConfig.js";
import authRouter from "./src/routes/authRoute.js";
import expoRoute from "./src/routes/expoRoute.js";
import boothRoute from "./src/routes/boothRoute.js";
import scheduleRoute from "./src/routes/scheduleRoute.js";
import websiteSettingsRoute from "./src/routes/websiteSettingsRoute.js";
import userRoute from "./src/routes/userRoute.js";
import attendeeRoute from "./src/routes/attendeeRoute.js";
import uploadRoute from "./src/routes/uploadRoute.js";
import eventRoute from "./src/routes/eventRoute.js";
import messageRoute from "./src/routes/messageRoute.js";
import exhibitorRoute from "./src/routes/exhibitorRoute.js";
import analyticsRoute from "./src/routes/analyticsRoute.js";
import router from "./src/routes/exhibitorProfileRoute.js";

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());


app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "EventSphere backend is running",
  });
});

app.use(async (req, res, next) => {
  try {
    await database();
    next();
  } catch (err) {
    console.log("DB connection error:", err.message);

    res.status(500).json({
      msg: "Database connection failed",
    });
  }
});

app.use("/api", authRouter);
app.use("/api/expo", expoRoute);
app.use("/api/booth", boothRoute);
app.use("/api/schedule", scheduleRoute);
app.use("/api/website-settings", websiteSettingsRoute);
app.use("/api/users", userRoute);
app.use("/api/attendees", attendeeRoute);
app.use("/api/upload", uploadRoute);
app.use("/uploads", express.static("uploads"));
app.use("/api/event", eventRoute);
app.use("/api/message", messageRoute);
app.use("/api/exhibitors", exhibitorRoute);
app.use("/api/analytics", analyticsRoute);
app.use("/api/exhibitor-profile", router);

if (!process.env.VERCEL) {
  const port = process.env.PORT || 3200;

  database()
  app.listen(port, () => {
      console.log(`http://localhost:${port}`);
    });
}

export default app;
