import express from "express";
import {
  saveSale,
  fetchSales,
  fetchSaleById,
  fetchSalesReport,
} from "../controllers/salesController.js";

const router = express.Router();

router.post("/", saveSale);
router.get("/report", fetchSalesReport); // ⬅️ LETAKKAN INI LEBIH DULU
router.get("/:id", fetchSaleById); // ⬅️ LETAKKAN INI SETELAH YANG SPESIFIK
router.get("/", fetchSales);

export default router;