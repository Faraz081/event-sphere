import express from 'express'
import { createSchedule } from '../controllers/scheduleController.js';

const scheduleRoute = express.Router();
scheduleRoute.post("/", createSchedule)

export default scheduleRoute