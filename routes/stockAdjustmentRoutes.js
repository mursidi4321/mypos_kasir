import express from "express";
import {
  createStockAdjustment,
  listStockAdjustments,
  getTotalAdjustment,
} from "../controllers/stockAdjustmentController.js";

const router = express.Router();

// Buat penyesuaian stok baru
router.post("/", createStockAdjustment);

// Ambil semua penyesuaian stok
router.get("/", listStockAdjustments);

// Ambil total penyesuaian stok per produk
router.get("/total/:product_id", getTotalAdjustment);

export default router;
