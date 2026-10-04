import express from "express";
import { getPublicExpos, getPublicExpo, getPublicExhibitors, getPublicBooths } from "../controllers/publicController.js";

const publicRoute = express.Router();

publicRoute.get("/expos", getPublicExpos);
publicRoute.get("/expos/:id", getPublicExpo);
publicRoute.get("/expos/:id/exhibitors", getPublicExhibitors);
publicRoute.get("/expos/:id/booths", getPublicBooths);

export default publicRoute;