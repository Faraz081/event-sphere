import express from "express";
import "dotenv/config";
import cors from "cors";
import { networkInterfaces } from "node:os";
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
import boothExhibitorRoute from "./src/routes/boothExhibitorRoute.js";
import publicRoute from "./src/routes/publicRoute.js";
import attendeeSelfRoute from "./src/routes/attendeeSelfRoute.js";
import feedbackRoute from "./src/routes/feedbackRoute.js";
import adminTicketRoute from "./src/routes/adminTicketRoute.js";
import adminEventRoute from "./src/routes/adminEventRoute.js";
import ensureAdminExists from "./src/controllers/authController.js";

const app = express();

const allowedOrigins = new Set(
  [
    process.env.CLIENT_URL,
    ...[5173, 5174, 5175, 4173].flatMap((port) => [
      `http://localhost:${port}`,
      `http://127.0.0.1:${port}`,
    ]),
  ]
    .filter(Boolean)
    .map((origin) => origin.replace(/\/+$/, ""))
);

const frontendPorts = [5173, 5174, 5175, 4173];
for (const interfaces of Object.values(networkInterfaces())) {
  for (const address of interfaces || []) {
    if (address.family !== "IPv4" || address.internal) continue;
    for (const port of frontendPorts) {
      allowedOrigins.add(`http://${address.address}:${port}`);
    }
  }
}

const isPrivateIpv4 = (hostname) => {
  const octets = hostname.split(".").map(Number);
  if (
    octets.length !== 4 ||
    octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)
  ) {
    return false;
  }

  const [first, second] = octets;
  return (
    first === 10 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
};

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }

    let isLocalFrontend = false;
    try {
      const parsedOrigin = new URL(origin);
      isLocalFrontend =
        parsedOrigin.protocol === "http:" &&
        frontendPorts.includes(Number(parsedOrigin.port)) &&
        isPrivateIpv4(parsedOrigin.hostname);
    } catch {
      isLocalFrontend = false;
    }
    callback(null, isLocalFrontend);
  },
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
app.use("/api/booth", boothExhibitorRoute);
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
app.use("/api/public", publicRoute);
app.use("/api/attendee-portal", attendeeSelfRoute);
app.use("/api/feedback", feedbackRoute);
app.use("/api/admin/tickets", adminTicketRoute);
app.use("/api/admin/events", adminEventRoute);

if (!process.env.VERCEL) {
  const port = process.env.PORT || 3200;

  database().then(async () => {
    await ensureAdminExists();
    app.listen(port, () => {
      console.log(`http://localhost:${port}`);
    });
  });
}
export default app;
