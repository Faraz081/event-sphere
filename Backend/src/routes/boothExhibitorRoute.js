import express from "express";
import identifyUser from "../middleware/identifyUser.js";
import { getAvailableBooths, getMyBooth, reserveBooth, releaseBooth, updateBoothDetails } from "../controllers/boothExhibitorController.js";

const boothExhibitorRoute = express.Router();

boothExhibitorRoute.get("/available", identifyUser, getAvailableBooths);
boothExhibitorRoute.get("/mine", identifyUser, getMyBooth);
boothExhibitorRoute.put("/:id/reserve", identifyUser, reserveBooth);
boothExhibitorRoute.put("/:id/release", identifyUser, releaseBooth);
boothExhibitorRoute.put("/:id/details", identifyUser, updateBoothDetails);

export default boothExhibitorRoute;