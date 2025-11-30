import {
  createPurchase,
  getPurchaseReport,
  getPurchaseById,
  deletePurchase,
} from "../models/purchaseModel.js";

// import { insertCashflowFromPurchase } from "../models/cashflowModel.js";
/**
 * POST /api/purchases
 * Menyimpan pembelian baru + item pembelian + update stok
 */
export async function createPurchaseHandler(req, res) {
  try {
    const { supplier, invoice, total, items } = req.body;

    // Validasi
    if (
      !supplier ||
      !invoice ||
      !total ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({ message: "Data pembelian tidak lengkap." });
    }

    const id = await createPurchase(supplier, invoice, total, items);

    res.status(201).json({
      message: "✅ Pembelian berhasil disimpan",
      purchase_id: id,
    });
  } catch (error) {
    console.error("❌ Gagal menyimpan pembelian:", error);
    res.status(500).json({
      message: error.sqlMessage || error.message || "Terjadi kesalahan server",
    });
  }
}

/**
 * GET /api/purchases/:id
 * Ambil data pembelian berdasarkan ID
 */
export async function getPurchaseByIdHandler(req, res) {
  try {
    const id = req.params.id;
    const purchase = await getPurchaseById(id);

    if (!purchase) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.json(purchase);
  } catch (error) {
    console.error("❌ Gagal mengambil data pembelian:", error);
    res.status(500).json({ message: error.message });
  }
}

/**
 * DELETE /api/purchases/:id
 * Hapus data pembelian
 */
export async function deletePurchaseHandler(req, res) {
  try {
    const id = req.params.id;
    const result = await deletePurchase(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    res.json({ message: "🗑️ Data pembelian berhasil dihapus" });
  } catch (error) {
    console.error("❌ Gagal menghapus pembelian:", error);
    res.status(500).json({ message: error.message });
  }
}

export async function getPurchaseReportHandler(req, res) {
  try {
    const { start, end, supplier } = req.query;
    const data = await getPurchaseReport(start, end, supplier);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
