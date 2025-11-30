import db from "../config/db.js";

// Ambil semua produk
export async function getAllProducts() {
  const [rows] = await db.execute("SELECT * FROM products ORDER BY id DESC");
  return rows;
}

// Ambil produk berdasarkan ID
export async function getProductById(id) {
  const [rows] = await db.execute("SELECT * FROM products WHERE id = ?", [id]);
  return rows[0];
}

// Tambah produk baru
export async function createProduct(product) {
  const {
    name,
    code,
    barcode,
    purchase_price = 0,
    price,
    stock = 0,
    min_stock = 0,
    type = "barang", // default barang
  } = product;

  // 🔎 Cek apakah barcode sudah ada
  if (barcode) {
    const [existing] = await db.execute(
      "SELECT id FROM products WHERE barcode = ? LIMIT 1",
      [barcode]
    );
    if (existing.length > 0) {
      throw new Error("Barcode sudah digunakan untuk produk lain.");
    }
  }
const normalizedBarcode = barcode && barcode.trim() !== "" ? barcode : null;

  const [result] = await db.execute(
    `INSERT INTO products (name, code, barcode, purchase_price, price, stock, min_stock, type, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [name, code, normalizedBarcode, purchase_price, price, stock, min_stock, type]
  );
  // console.log(result);
  return { id: result.insertId, ...product };
}

// Update produk
export async function updateProduct(id, product) {
  const { 
    name,
    code,
    barcode,
    purchase_price,
    price,
    stock,
    min_stock,
    type
  } = product;

  // Normalisasi barcode kosong → NULL
  const normalizedBarcode = barcode && barcode.trim() !== "" ? barcode : null;

  // Cek duplikat barcode hanya jika barcode tidak null
  if (normalizedBarcode) {
    const [existing] = await db.execute(
      "SELECT id FROM products WHERE barcode = ? AND id != ? LIMIT 1",
      [normalizedBarcode, id]
    );

    if (existing.length > 0) {
      throw new Error("Barcode sudah digunakan untuk produk lain.");
    }
  }

  const [result] = await db.execute(
    `UPDATE products 
     SET name = ?, code = ?, barcode = ?, purchase_price = ?, price = ?, stock = ?, min_stock = ?, type = ?
     WHERE id = ?`,
    [name, code, normalizedBarcode, purchase_price, price, stock, min_stock, type, id]
  );

  return { affectedRows: result.affectedRows };
}


// Hapus produk
export async function deleteProduct(id) {
  const [result] = await db.execute("DELETE FROM products WHERE id = ?", [id]);
  return { affectedRows: result.affectedRows };
}

// Produk dengan stok minimum
export async function getLowStockProducts() {
  const [rows] = await db.execute(
    `
    SELECT 
      code,
      name,
      stock,
      min_stock,
      purchase_price
    FROM products
    WHERE type = 'barang'
      AND stock <= min_stock
    ORDER BY stock ASC
    `
  );
  return rows;
}


// Tambah stok (hanya untuk barang)
export async function addStock(productId, quantity) {
  const [result] = await db.execute(
    "UPDATE products SET stock = stock + ? WHERE id = ? AND type = 'barang'",
    [quantity, productId]
  );
  return result.affectedRows;
}

// Cari produk berdasarkan query
export async function searchProductByQuery(query) {
  const q = `%${query.toLowerCase()}%`;
  const [rows] = await db.query(
    `SELECT * FROM products
     WHERE LOWER(name) LIKE ? OR LOWER(code) LIKE ? OR LOWER(barcode) LIKE ?
     LIMIT 10`,
    [q, q, q]
  );
  return rows;
}

// Buat kode produk otomatis
export async function getNextProductCodeFromDB() {
  const [rows] = await db.execute(
    "SELECT MAX(code) AS last_code FROM products WHERE code LIKE 'PRD%'"
  );

  const lastCode = rows[0]?.last_code;
  let nextNumber = 1;

  if (lastCode) {
    const num = parseInt(lastCode.replace("PRD", ""));
    if (!isNaN(num)) {
      nextNumber = num + 1;
    }
  }

  return "PRD" + nextNumber.toString().padStart(3, "0");
}


export async function checkDuplicateBarcode(barcode) {
  const [rows] = await db.execute(
    "SELECT id FROM products WHERE barcode = ? LIMIT 1",
    [barcode]
  );
  return rows.length > 0; // ✅ true kalau ada
}

