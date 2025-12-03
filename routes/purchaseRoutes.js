import express from "express";
import {
  savePurchase,
  fetchPurchases,
  fetchPurchaseById,
  removePurchase,
  fetchPurchaseReport,
} from "../controllers/purchaseController.js";

const router = express.Router();

router.post("/", savePurchase);
router.get("/report", fetchPurchaseReport);
router.get("/:id", fetchPurchaseById);
router.get("/", fetchPurchases);
router.delete("/:id", removePurchase);

export default router;
