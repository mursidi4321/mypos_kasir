import stockAdjustmentService from "../services/stockAdjustmentService.js";

/**
 * Controller untuk membuat penyesuaian stok
 */
export async function createStockAdjustment(req, res) {
  try {
    const { product_id, adjustment, reason } = req.body;

    if (!product_id || !adjustment || !reason) {
      return res.status(400).json({ message: "Product, adjustment, dan reason wajib diisi" });
    }

    await stockAdjustmentService.create(product_id, Number(adjustment), reason);

    res.status(201).json({ message: "Penyesuaian stok berhasil dibuat" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan saat membuat penyesuaian stok" });
  }
}

/**
 * Controller untuk mengambil semua penyesuaian stok
 */
export async function listStockAdjustments(req, res) {
  try {
    const data = await stockAdjustmentService.getAll();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan saat mengambil data penyesuaian stok" });
  }
}

/**
 * Controller untuk total penyesuaian stok per produk
 */
export async function getTotalAdjustment(req, res) {
  try {
    const { product_id } = req.params;

    if (!product_id) {
      return res.status(400).json({ message: "Product ID wajib diisi" });
    }

    const total = await stockAdjustmentService.getTotalAdjustment(product_id);
    res.json({ product_id, totalAdjustment: total });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan saat menghitung total penyesuaian" });
  }
}
