import express from 'express'
import { createBooth } from '../controllers/boothController.js';

const boothRoute = express.Router();
boothRoute.post("/", createBooth)

export default boothRoute