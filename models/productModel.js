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
    price = 0,
    stock = 0,
    min_stock = 0,
    type = "barang",
    wholesale_price = null,
    wholesale_min_qty = 0,
    image_path = null
  } = product;

  const normalizedBarcode = barcode?.trim() || null;

  if (normalizedBarcode) {
    const [existing] = await db.execute(
      "SELECT id FROM products WHERE barcode = ? LIMIT 1",
      [normalizedBarcode]
    );
    if (existing.length > 0) throw new Error("Barcode sudah digunakan");
  }

  const [result] = await db.execute(
    `INSERT INTO products
      (name, code, barcode, purchase_price, price, stock, min_stock, type, wholesale_price, wholesale_min_qty, image_path, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
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
      image_path
    ]
  );

  return {
    id: result.insertId,
    ...product,
    barcode: normalizedBarcode
  };
}




// Update produk berdasarkan ID
export async function updateProduct(id, updates) {
  const normalizedBarcode = updates.barcode?.trim() || null;

  const [exists] = await db.execute(
    "SELECT id FROM products WHERE id = ? LIMIT 1",
    [id]
  );
  if (exists.length === 0) throw new Error("Produk tidak ditemukan");

  if (normalizedBarcode) {
    const [check] = await db.execute(
      "SELECT id FROM products WHERE barcode = ? AND id != ? LIMIT 1",
      [normalizedBarcode, id]
    );
    if (check.length > 0) throw new Error("Barcode sudah digunakan");
  }

  const fields = [];
  const values = [];

  for (const key in updates) {
    if (updates[key] !== undefined) {
      if (key === "barcode") {
        fields.push("barcode = ?");
        values.push(normalizedBarcode);
      } else {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    }
  }

  values.push(id);

  await db.execute(
    `UPDATE products SET ${fields.join(", ")} WHERE id = ?`,
    values
  );

  return { id, ...updates, barcode: normalizedBarcode };
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

  if (rows.length === 0)
    throw new Error("Produk tidak ditemukan atau sudah dihapus");

  const product = rows[0];
  let finalPrice = product.price;

  if (
    product.wholesale_price !== null &&
    quantity >= product.wholesale_min_qty
  ) {
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
