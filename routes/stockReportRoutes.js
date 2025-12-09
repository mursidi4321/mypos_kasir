import express from "express";
import { getStockReport } from "../controllers/StockReportController.js";

const router = express.Router();

router.get("/", getStockReport);

export default router;
