import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  addStock,
  searchProductByQuery,
  getNextProductCodeFromDB, checkDuplicateBarcode,
} from "../models/productModel.js";

// GET /api/products
export async function getProducts(req, res) {
  try {
    const products = await getAllProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/products/:id
export async function getProduct(req, res) {
  try {
    const product = await getProductById(req.params.id);
    if (!product)
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/products
export async function addProduct(req, res) {
  // console.log(req.body)
  try {
    const newProduct = await createProduct(req.body);
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PUT /api/products/:id
export async function editProduct(req, res) {
  try {
    const result = await updateProduct(req.params.id, req.body);
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Produk tidak ditemukan atau tidak diubah" });
    }
    res.json({ message: "Produk berhasil diperbarui" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// DELETE /api/products/:id
export async function removeProduct(req, res) {
  try {
    const result = await deleteProduct(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    }
    res.json({ message: "Produk berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/products/low-stock
export async function getLowStock(req, res) {
  try {
    const products = await getLowStockProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/products/:id/add-stock
export async function increaseStock(req, res) {
  try {
    const { quantity } = req.body;
    const result = await addStock(req.params.id, quantity);
    if (result === 0) {
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    }
    res.json({ message: "Stok berhasil ditambahkan" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/products/search?q=...
export async function searchProduct(req, res) {
  try {
    const query = req.query.q;
    const products = await searchProductByQuery(query);

    if (!products || products.length === 0) {
      return res.status(404).json({ error: "Produk tidak ditemukan" });
    }

    res.json(products); // ← kirimkan array
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/products/next-code
export async function getNextProductCode(req, res) {
  try {
    const nextCode = await getNextProductCodeFromDB();
    res.json({ nextCode });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/products/check-barcode/:barcode
export async function checkBarcode(req, res) {
  try {
    const { barcode } = req.params;

    // Validasi input
    if (!barcode || barcode.trim() === "") {
      return res.status(400).json({ error: "Barcode harus diisi" });
    }

    // Panggil fungsi dari model (pastikan model-nya ada)
    const exists = await checkDuplicateBarcode(barcode);

    res.json({ exists }); // ✅ kirim hasil ke frontend
  } catch (err) {
    console.error("Error checking barcode:", err);
    res.status(500).json({ error: err.message });
  }
}

