import express from 'express';
import "dotenv/config"
import cors from "cors";
import database from "./src/config/dbConfig.js"
import authRouter from './src/routes/authRoute.js';
import expoRoute from './src/routes/expoRoute.js';
import boothRoute from './src/routes/boothRoute.js';
import scheduleRoute from './src/routes/scheduleRoute.js';

const app = express()
const allowedOrigins = [process.env.CLIENT_URL, "http://localhost:5173"];
app.use(cors({origin: allowedOrigins, credentials: true}))
app.use(express.json())

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "EventSphere backend is running" });
});

app.use(async (req, res, next) => {
  try {
    await database();
    next();
  } catch (err) {
    console.log("DB connection error:", err.message);
    res.status(500).json({ msg: "Database connection failed" });
  }
});

app.use("/api", authRouter)
app.use("/api/expo", expoRoute)
app.use("/api/booth", boothRoute)
app.use("/api/schedule", scheduleRoute)

if (!process.env.VERCEL) {
  const port = process.env.PORT || 3200;
  database().then(() => {
    app.listen(port, ()=> console.log(`http://localhost:${port}`));
  });
}

export default app;