import express from "express";
import { getPublicExpos, getPublicExpo, getPublicExhibitors, getPublicBooths, getPublicEvents, getPublicExhibitorProfile, getPublicEventStalls } from "../controllers/publicController.js";

const publicRoute = express.Router();

publicRoute.get("/expos", getPublicExpos);
publicRoute.get("/expos/:id", getPublicExpo);
publicRoute.get("/expos/:id/exhibitors", getPublicExhibitors);
publicRoute.get("/expos/:id/booths", getPublicBooths);
publicRoute.get("/events", getPublicEvents);
publicRoute.get("/exhibitors/:id", getPublicExhibitorProfile);
publicRoute.get("/events/:id/stalls", getPublicEventStalls);

export default publicRoute;