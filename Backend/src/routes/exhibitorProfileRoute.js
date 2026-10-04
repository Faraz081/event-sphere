import express from "express";
import multer from "multer";
import identifyUser from "../middleware/identifyUser.js";
import { applyForExpo, getMyApplications, getProfile, updateProfile, getExpos } from "../controllers/exhibitorProfileController.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
}); // 5MB

router.post(
  "/apply",
  identifyUser,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "documents", maxCount: 5 },
  ]),
  applyForExpo
);

router.get("/expos", identifyUser, getExpos);

router.get("/applications", identifyUser, getMyApplications);

router.get("/profile", identifyUser, getProfile);

router.put("/profile", identifyUser, upload.single("logo"), updateProfile);

export default router;