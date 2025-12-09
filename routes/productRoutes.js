import express from "express";
import upload from "../middlewares/multerConfig.js";
import {
  addProduct,
  getNextProductCode,
  getProducts,
  searchProduct,
  getLowStock,
  getProduct,
  editProduct,
  removeProduct,
  checkBarcode,
  getPrice,
} from "../controllers/productController.js";

const router = express.Router();

// Ambil semua produk aktif
router.get("/", getProducts);

// Tambah produk baru + upload gambar
router.post("/", upload.single("image"), addProduct);

// Ambil kode produk berikutnya
router.get("/next-code", getNextProductCode);

// Pencarian produk
router.get("/search", searchProduct);

// Cek duplikat barcode
router.get("/check-barcode/:barcode", checkBarcode);

// Produk dengan stok rendah
router.get("/low-stock", getLowStock);

// Ambil produk berdasarkan ID
router.get("/:id", getProduct);

// Ambil harga produk sesuai quantity
router.get("/:id/price", getPrice);

// Update produk + upload gambar
router.put("/:id", upload.single("image"), editProduct);

// Soft delete produk
router.delete("/:id", removeProduct);

// Produk + stok saat ini (stok + total penyesuaian)
router.get("/with-stock", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        p.id,
        p.name,
        p.stock + IFNULL(SUM(sa.adjustment), 0) AS current_stock
      FROM products p
      LEFT JOIN stock_adjustments sa ON p.id = sa.product_id
      GROUP BY p.id, p.name, p.stock
      ORDER BY p.name ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil data produk + stok" });
  }
});

export default router;
