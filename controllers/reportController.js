import {
  getDashboardData,
  getSalesData,
  getProfitLossData,
  getPurchaseData,
  getStockData,
} from "../models/reportModel.js";

// GET /api/reports/dashboard
export const getDashboardReport = async (req, res) => {
  try {
    const data = await getDashboardData();
    res.json(data);
  } catch (err) {
    console.error("❌ Error in getDashboardReport:", err);
    res.status(500).json({ error: "Gagal mengambil data laporan dashboard" });
  }
};

// GET /api/reports/sales?start=...&end=...
export const getSalesReport = async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end)
    return res.status(400).json({ error: "Parameter tanggal wajib diisi" });

  try {
    const data = await getSalesData(start, end);
    res.json(data);
  } catch (err) {
    console.error("❌ Error in getSalesReport:", err);
    res.status(500).json({ error: "Gagal mengambil data penjualan" });
  }
};

// GET /api/reports/profit-loss
export const getProfitLossReport = async (req, res) => {
  const { start, end } = req.query;
  const report = await getProfitLoss(start, end);
  res.json(report);
};

// controllers/reportController.js
import { getProfitLoss } from "../models/reportModel.js";

export const profitLossReport = async (req, res) => {
  try {
    const start = req.query.start;
    const end = req.query.end;
    if (!start || !end) {
      return res
        .status(400)
        .json({ error: "Parameter start dan end diperlukan" });
    }

    const report = await getProfitLoss(start, end);
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/reports/purchases?start=...&end=...
export const getPurchaseReport = async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end)
    return res.status(400).json({ error: "Parameter tanggal wajib diisi" });

  try {
    const data = await getPurchaseData(start, end);
    res.json(data);
  } catch (err) {
    console.error("❌ Error in getPurchaseReport:", err);
    res.status(500).json({ error: "Gagal mengambil data pembelian" });
  }
};

// GET /api/reports/stock
export const getStockReport = async (req, res) => {
  try {
    const data = await getStockData();
    res.json(data);
  } catch (err) {
    console.error("❌ Error in getStockReport:", err);
    res.status(500).json({ error: "Gagal mengambil data stok" });
  }
};

// GET /api/reports/low-stock
import { getLowStockProducts } from "../models/reportModel.js";
export const getLowStockReport = async (req, res) => {
  try {
    const data = await getLowStockProducts();
    res.json(data);
  } catch (err) {
    console.error("❌ Error in getLowStockReport:", err);
    res.status(500).json({ error: "Gagal mengambil data stok rendah" });
  }
};

import {getTopSellingProducts} from '../models/salesModel.js'


export const topSelling = async (req, res) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();

    const data = await getTopSellingProducts(month, year);

    res.json({
      month,
      year,
      data,
    });
  } catch (err) {
    console.error("Error laporan terlaris:", err);
    res.status(500).json({ message: "Gagal memuat laporan" });
  }
};
