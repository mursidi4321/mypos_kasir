import {
  createPurchase,
  getAllPurchases,
  getPurchaseById,
  deletePurchase,
  getPurchaseReport,
} from "../models/purchaseModel.js";

// import { useAlert } from "../composables/useAlert.js"; // optional jika pakai alert di frontend

export const savePurchase = async (req, res) => {
  try {
    const { supplier, invoice_number, items } = req.body;

    if (!supplier || !invoice_number || !items?.length) {
      return res.status(400).json({ message: "Data pembelian tidak lengkap" });
    }

    // Filter item: hanya simpan yang type 'barang'
    const validItems = items.filter((i) => i.type === "barang");

    if (!validItems.length) {
      return res
        .status(400)
        .json({ message: "Tidak ada produk barang yang valid" });
    }

    // Hitung total
    const total = validItems.reduce(
      (sum, i) => sum + (i.qty || 0) * (i.buy_price || 0),
      0
    );

    // Simpan purchase
    const purchaseId = await createPurchase(
      supplier,
      invoice_number,
      total,
      validItems
    );

    res.status(201).json({
      message: "Pembelian berhasil disimpan",
      id: purchaseId,
    });
  } catch (err) {
    console.error("❌ Gagal menyimpan pembelian:", err);
    res.status(500).json({ message: err.message });
  }
};

export const fetchPurchases = async (req, res) => {
  try {
    const purchases = await getAllPurchases();
    res.json(purchases);
  } catch (err) {
    console.error("❌ Gagal mengambil data pembelian:", err);
    res.status(500).json({ message: err.message });
  }
};

export const fetchPurchaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const purchase = await getPurchaseById(id);

    if (!purchase.length) {
      return res.status(404).json({ message: "Pembelian tidak ditemukan" });
    }

    res.json(purchase);
  } catch (err) {
    console.error("❌ Gagal mengambil detail pembelian:", err);
    res.status(500).json({ message: err.message });
  }
};

export const removePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    await deletePurchase(id);
    res.json({ message: "Pembelian berhasil dihapus" });
  } catch (err) {
    console.error("❌ Gagal menghapus pembelian:", err);
    res.status(500).json({ message: err.message });
  }
};

export const fetchPurchaseReport = async (req, res) => {
  try {
    const { start, end, supplier } = req.query;
    if (!start || !end) {
      return res
        .status(400)
        .json({ message: "Tanggal mulai dan selesai diperlukan" });
    }

    const report = await getPurchaseReport(start, end, supplier || "all");
    res.json(report);
  } catch (err) {
    console.error("❌ Gagal mengambil laporan pembelian:", err);
    res.status(500).json({ message: err.message });
  }
};
