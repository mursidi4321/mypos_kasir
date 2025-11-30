import express from "express";
import {
  getCashflows,
  createCashflow,
  updateCashflow,
  deleteCashflow,
} from "../controllers/cashflowController.js"; // ✅ sesuai nama file

const router = express.Router();

router.get("/", getCashflows);
router.post("/", createCashflow);
router.put("/:id", updateCashflow);
router.delete("/:id", deleteCashflow);

export default router;