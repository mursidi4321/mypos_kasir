import express from "express";
import {
  getCashflow,
  getBalance,
  addCashflow,
  updateCashflow,
  deleteCashflow
} from "../controllers/cashflowController.js";

const router = express.Router();

router.get("/", getCashflow);
router.get("/balance", getBalance);
router.post("/", addCashflow);
router.put("/:id", updateCashflow);
router.delete("/:id", deleteCashflow);

export default router;
