import express from "express";
import {
  adjustStock,
  getAdjustmentHistory,
  getOpeningStock,
} from "../controllers/stockController.js";

const router = express.Router();

router.get("/", getOpeningStock); // ← WAJIB ADA
router.get("/history", getAdjustmentHistory);
router.post("/adjust", adjustStock);

export default router;
