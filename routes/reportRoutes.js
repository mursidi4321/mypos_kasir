// routes/reportRoute.js
import express from "express";
import {
  getDailyReport,
  getProductSalesReport,
  getProfitReport,
  getTopSellingReport,
} from "../controllers/reportController.js";

const router = express.Router();

router.get("/daily", getDailyReport);
router.get("/products", getProductSalesReport);
router.get("/profit", getProfitReport);
router.get("/top-selling", getTopSellingReport);

export default router;
