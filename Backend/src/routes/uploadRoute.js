import express from "express";
import multer from "multer";
import { uploadImage, deleteImage } from "../controllers/uploadController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const uploadRoute = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

uploadRoute.post(
  "/image",
  authMiddleware,
  upload.single("image"),
  uploadImage
);

uploadRoute.delete(
  "/image",
  authMiddleware,
  adminMiddleware,
  deleteImage
);

export default uploadRoute;