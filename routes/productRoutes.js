import express from "express";
import {
  addProduct,
  getNextProductCode,
  getProducts,
  searchProduct,
  getLowStock,
  getProduct,
  editProduct,
  removeProduct, checkBarcode,
} from "../controllers/productController.js";

const router = express.Router();

// Routes
router.get("/", getProducts);

router.post("/", addProduct);
router.get("/next-code", getNextProductCode);
router.get("/search", searchProduct);
router.get("/check-barcode/:barcode", checkBarcode);
router.get("/low-stock", getLowStock);
router.get("/:id", getProduct);
router.put("/:id", editProduct);
router.delete("/:id", removeProduct);

export default router;
