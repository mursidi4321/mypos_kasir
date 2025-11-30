// routes/purchaseRoutes.js
import express from "express";
import {
  createPurchaseHandler,
  getPurchaseReportHandler,
} from "../controllers/purchaseController.js";

const router = express.Router();

router.post("/", createPurchaseHandler);
router.get("/report", getPurchaseReportHandler);

export default router;
