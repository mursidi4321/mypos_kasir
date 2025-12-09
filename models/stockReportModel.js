import db from "../config/db.js";

/** Ambil semua produk */
export async function getAllProducts() {
  const [rows] = await db.execute(
    `SELECT id, name, purchase_price 
     FROM products 
     WHERE deleted_at IS NULL 
     AND type="barang"`
  );

  return rows;
}

/** Stok masuk (pembelian) dalam periode */
export async function getStockIn(productId, start, end) {
  const [rows] = await db.execute(
    `SELECT SUM(qty) AS totalIn
     FROM purchase_items
     JOIN purchases ON purchases.id = purchase_items.purchase_id
     WHERE product_id = ?
     AND DATE(purchases.date) BETWEEN ? AND ?`,
    [productId, start, end]
  );
  return Number(rows[0].totalIn || 0);
}

/** Stok keluar (penjualan) dalam periode */
export async function getStockOut(productId, start, end) {
  const [rows] = await db.execute(
    `SELECT SUM(quantity) AS totalOut
     FROM sales_items
     JOIN sales ON sales.id = sales_items.sale_id
     WHERE product_id = ?
     AND DATE(sales.created_at) BETWEEN ? AND ?`,
    [productId, start, end]
  );
  return Number(rows[0].totalOut || 0);
}

/** Stok masuk sebelum tanggal start */
export async function getStockInBefore(productId, start) {
  const [rows] = await db.execute(
    `SELECT SUM(qty) AS tIn
     FROM purchase_items
     JOIN purchases ON purchases.id = purchase_items.purchase_id
     WHERE product_id = ?
     AND DATE(purchases.date) < ?`,
    [productId, start]
  );
  return Number(rows[0].tIn || 0);
}

/** Stok keluar sebelum tanggal start */
export async function getStockOutBefore(productId, start) {
  const [rows] = await db.execute(
    `SELECT SUM(quantity) AS tOut
     FROM sales_items
     JOIN sales ON sales.id = sales_items.sale_id
     WHERE product_id = ?
     AND DATE(sales.created_at) < ?`,
    [productId, start]
  );
  return Number(rows[0].tOut || 0);
}

/** Harga beli terakhir (hybrid) */
export async function getLastBuyPrice(productId) {
  const [rows] = await db.execute(
    `SELECT buy_price
     FROM purchase_items
     JOIN purchases ON purchases.id = purchase_items.purchase_id
     WHERE product_id = ?
     ORDER BY purchases.date DESC
     LIMIT 1`,
    [productId]
  );

  // jika tidak ada pembelian → fallback ke purchase_price di table products
  if (rows.length) return Number(rows[0].buy_price);

  const [prod] = await db.execute(
    `SELECT purchase_price FROM products WHERE id = ?`,
    [productId]
  );

  return Number(prod[0]?.purchase_price || 0);
}
