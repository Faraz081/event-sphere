import express from "express";
import { getPublicExpos, getPublicExpo, getPublicExhibitors, getPublicBooths, getPublicEvents } from "../controllers/publicController.js";

const publicRoute = express.Router();

publicRoute.get("/expos", getPublicExpos);
publicRoute.get("/expos/:id", getPublicExpo);
publicRoute.get("/expos/:id/exhibitors", getPublicExhibitors);
publicRoute.get("/expos/:id/booths", getPublicBooths);
publicRoute.get("/events", getPublicEvents);

export default publicRoute;