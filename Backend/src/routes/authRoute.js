import express from "express";
import { login, register } from "../controllers/authController.js";
import { verifyEmail, verifyOtp, resetPassword } from "../controllers/passwordController.js";

const authRouter = express.Router();
authRouter.post("/login", login);
authRouter.post("/register", register);
authRouter.post("/verify-email", verifyEmail);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/reset-password", resetPassword);

export default authRouter;