import db from "../config/db.js";

// Ambil semua produk (hanya aktif)
export async function getAllProducts() {
  const [rows] = await db.execute(
    "SELECT * FROM products WHERE deleted_at IS NULL ORDER BY id DESC"
  );
  return rows;
}

// Ambil produk berdasarkan ID (hanya aktif)
export async function getProductById(id) {
  const [rows] = await db.execute(
    "SELECT * FROM products WHERE id = ? AND deleted_at IS NULL",
    [id]
  );
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
    type = "barang",
    wholesale_price = null,
    wholesale_min_qty = 0,
  } = product;

  // Cek barcode unik
  if (barcode) {
    const [existing] = await db.execute(
      "SELECT id FROM products WHERE barcode = ? LIMIT 1",
      [barcode]
    );
    if (existing.length > 0) throw new Error("Barcode sudah digunakan");
  }

  const normalizedBarcode = barcode?.trim() || null;

  const [result] = await db.execute(
    `INSERT INTO products
      (name, code, barcode, purchase_price, price, stock, min_stock, type, wholesale_price, wholesale_min_qty, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
    [
      name,
      code,
      normalizedBarcode,
      purchase_price,
      price,
      stock,
      min_stock,
      type,
      wholesale_price,
      wholesale_min_qty,
    ]
  );

  return { id: result.insertId, ...product };
}

// Update produk berdasarkan ID
export async function updateProduct(id, updates) {
  const {
    name,
    code,
    barcode,
    purchase_price,
    price,
    stock,
    min_stock,
    type,
    wholesale_price,
    wholesale_min_qty,
    deleted_at,
  } = updates;

  const [existingProduct] = await db.execute(
    "SELECT * FROM products WHERE id = ? LIMIT 1",
    [id]
  );
  if (existingProduct.length === 0) throw new Error("Produk tidak ditemukan");

  if (barcode) {
    const [barcodeCheck] = await db.execute(
      "SELECT id FROM products WHERE barcode = ? AND id != ? LIMIT 1",
      [barcode, id]
    );
    if (barcodeCheck.length > 0) throw new Error("Barcode sudah digunakan");
  }

  const fields = [];
  const values = [];

  if (name !== undefined) { fields.push("name = ?"); values.push(name); }
  if (code !== undefined) { fields.push("code = ?"); values.push(code); }
  if (barcode !== undefined) { fields.push("barcode = ?"); values.push(barcode?.trim() || null); }
  if (purchase_price !== undefined) { fields.push("purchase_price = ?"); values.push(purchase_price); }
  if (price !== undefined) { fields.push("price = ?"); values.push(price); }
  if (stock !== undefined) { fields.push("stock = ?"); values.push(stock); }
  if (min_stock !== undefined) { fields.push("min_stock = ?"); values.push(min_stock); }
  if (type !== undefined) { fields.push("type = ?"); values.push(type); }
  if (wholesale_price !== undefined) { fields.push("wholesale_price = ?"); values.push(wholesale_price); }
  if (wholesale_min_qty !== undefined) { fields.push("wholesale_min_qty = ?"); values.push(wholesale_min_qty); }
  if (deleted_at !== undefined) { fields.push("deleted_at = ?"); values.push(deleted_at); }

  if (fields.length === 0) throw new Error("Tidak ada field untuk diupdate");

  values.push(id);

  const query = `UPDATE products SET ${fields.join(", ")} WHERE id = ?`;
  await db.execute(query, values);

  return { id, ...updates };
}

// Soft delete produk
export async function softDeleteProduct(id) {
  const [result] = await db.execute(
    "UPDATE products SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL",
    [id]
  );
  return result.affectedRows > 0;
}

// Ambil harga produk sesuai quantity
export async function getProductPrice(productId, quantity = 1) {
  const [rows] = await db.execute(
    "SELECT id, name, price, wholesale_price, wholesale_min_qty FROM products WHERE id = ? AND deleted_at IS NULL LIMIT 1",
    [productId]
  );

  if (rows.length === 0) throw new Error("Produk tidak ditemukan atau sudah dihapus");

  const product = rows[0];
  let finalPrice = product.price;

  if (product.wholesale_price !== null && quantity >= product.wholesale_min_qty) {
    finalPrice = product.wholesale_price;
  }

  return {
    id: product.id,
    name: product.name,
    quantity,
    price: finalPrice,
    total: finalPrice * quantity,
  };
}

// Tambah stok
export async function addStock(productId, quantity) {
  const product = await getProductById(productId);
  if (!product) return 0;

  const [result] = await db.execute(
    "UPDATE products SET stock = stock + ? WHERE id = ?",
    [quantity, productId]
  );

  return result.affectedRows;
}

// Kurangi stok
export async function reduceStock(productId, quantity) {
  const product = await getProductById(productId);
  if (!product || product.stock < quantity) return 0;

  const [result] = await db.execute(
    "UPDATE products SET stock = stock - ? WHERE id = ?",
    [quantity, productId]
  );

  return result.affectedRows;
}

// Produk dengan stok minimum
export async function getLowStockProducts() {
  const [rows] = await db.execute(
    `SELECT code, name, stock, min_stock, purchase_price
     FROM products
     WHERE stock <= min_stock AND deleted_at IS NULL
     ORDER BY stock ASC`
  );
  return rows;
}

// Cari produk
export async function searchProductByQuery(query) {
  const q = `%${query.toLowerCase()}%`;
  const [rows] = await db.query(
    `SELECT * FROM products
     WHERE deleted_at IS NULL AND (LOWER(name) LIKE ? OR LOWER(code) LIKE ? OR LOWER(barcode) LIKE ?)
     LIMIT 10`,
    [q, q, q]
  );
  return rows;
}

// Kode produk otomatis
export async function getNextProductCodeFromDB() {
  const [rows] = await db.execute(
    "SELECT MAX(code) AS last_code FROM products WHERE code LIKE 'PRD%'"
  );

  const lastCode = rows[0]?.last_code;
  let nextNumber = 1;
  if (lastCode) {
    const num = parseInt(lastCode.replace("PRD", ""));
    if (!isNaN(num)) nextNumber = num + 1;
  }

  return "PRD" + nextNumber.toString().padStart(3, "0");
}

// Cek duplikat barcode
export async function checkDuplicateBarcode(barcode) {
  const [rows] = await db.execute(
    "SELECT id FROM products WHERE barcode = ? LIMIT 1",
    [barcode]
  );
  return rows.length > 0;
}
