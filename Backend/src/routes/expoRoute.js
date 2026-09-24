import express from 'express'
import { createExpo } from '../controllers/expoController.js';

const expoRoute = express.Router();
expoRoute.post("/", createExpo)

export default expoRoute;