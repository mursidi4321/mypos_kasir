import express from "express";
import upload from "../middlewares/multerConfig.js";
import { uploadProductImage } from "../controllers/uploadController.js";

const router = express.Router();

router.post(
  "/product-image",
  upload.single("image"),
  uploadProductImage
);

export default router;
