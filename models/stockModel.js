import db from "../config/db.js";

/** Ambil daftar produk untuk penyesuaian stok */
export const getOpeningStock = async () => {
  const [rows] = await db.execute(`
    SELECT 
      p.id,
      p.code,
      p.name,
      p.stock AS current_stock
    FROM products p
    WHERE p.deleted_at IS NULL
      AND p.type = 'barang'
    ORDER BY p.name ASC
  `);

  return rows;
};

/** Tambah penyesuaian stok */
export const addStockAdjustment = async (product_id, adjustment, reason) => {
  // Ambil stok lama
  const [[product]] = await db.execute(
    "SELECT stock FROM products WHERE id = ?",
    [product_id]
  );

  if (!product) throw new Error("Produk tidak ditemukan");

  const newStock = product.stock + Number(adjustment);

  // Insert log penyesuaian
  await db.execute(
    `INSERT INTO stock_adjustments (product_id, adjustment, reason)
     VALUES (?, ?, ?)`,
    [product_id, adjustment, reason || null]
  );

  // Update stok produk
  await db.execute("UPDATE products SET stock = ? WHERE id = ?", [
    newStock,
    product_id,
  ]);

  return {
    old_stock: product.stock,
    adjustment,
    new_stock: newStock,
  };
};

/** Ambil riwayat penyesuaian stok */
export const getStockAdjustmentHistory = async () => {
  const [rows] = await db.execute(`
    SELECT 
      sa.*, 
      p.name AS product_name, 
      p.code AS product_code
    FROM stock_adjustments sa
    JOIN products p ON sa.product_id = p.id
    ORDER BY sa.created_at DESC
  `);

  return rows;
};
