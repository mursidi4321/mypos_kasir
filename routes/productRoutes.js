import express from "express";
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

// Tambah produk baru
router.post("/", addProduct);

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

// Update produk
router.put("/:id", editProduct);

// Soft delete produk
router.delete("/:id", removeProduct);

export default router;
