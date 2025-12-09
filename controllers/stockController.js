import * as stockModel from "../models/stockModel.js";

/** Penyesuaian stok manual */
export const adjustStock = async (req, res) => {
  try {
    console.log(req.body);
    const { product_id, adjustment, reason } = req.body;

    if (!product_id || adjustment === undefined) {
      return res
        .status(400)
        .json({ error: "product_id dan adjustment harus diisi" });
    }

    const result = await stockModel.addStockAdjustment(
      product_id,
      adjustment,
      reason
    );

    res.json({
      success: true,
      message: "Stok berhasil disesuaikan",
      ...result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
};

/** Riwayat penyesuaian stok */
export const getAdjustmentHistory = async (req, res) => {
  try {
    const rows = await stockModel.getStockAdjustmentHistory();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/** Ambil daftar produk + stok saat ini */
export const getOpeningStock = async (req, res) => {
  try {
    const data = await stockModel.getOpeningStock();
    res.json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil data stok" });
  }
};
