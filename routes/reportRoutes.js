import express from "express";
import {
  getDashboardReport,
  getSalesReport,
  getProfitLossReport,
  getPurchaseReport,
  getStockReport,
  profitLossReport,
  getLowStockReport,topSelling,
} from "../controllers/reportController.js";

import {
  fetchExpenses,
  addExpense,
  editExpense,
  removeExpense,
} from "../controllers/expenseController.js";


const router = express.Router();

// 📊 Report Routes
router.get("/dashboard", getDashboardReport);
router.get("/sales", getSalesReport);
router.get("/profit-loss", getProfitLossReport); // Lama (bisa diganti)
router.get("/purchases", getPurchaseReport);
router.get("/stock", getStockReport);
router.get("/low-stock", getLowStockReport);
router.get('/top-selling', topSelling)

// Optional: Route baru jika profit-loss versi berbeda
router.get("/profit-loss-detail", profitLossReport);

// 💸 Expenses Routes
router.get("/expenses", fetchExpenses);
router.post("/expenses", addExpense);
router.put("/expenses/:id", editExpense);
router.delete("/expenses/:id", removeExpense);

export default router;
