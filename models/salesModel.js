import db from "../config/db.js";
import { insertCashflowFromSale } from "./cashflowModel.js"; // ✅ Tambahkan ini

// Simpan penjualan + item + update stok + cashflow
export async function createSale({
  date,
  items,
  total,
  payment,
  change,
  invoice_number,
}) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Simpan ke tabel sales
    const [saleRes] = await connection.execute(
      "INSERT INTO sales (date, total, payment, change_amount, invoice_number) VALUES (?, ?, ?, ?, ?)",
      [date, total, payment, change, invoice_number]
    );
    const saleId = saleRes.insertId;

    // Simpan item-item ke tabel sale_items
    const itemValues = items.map((item) => [
      saleId,
      item.product_code,
      item.name,
      item.qty,
      item.price,
      item.subtotal,
    ]);

    await connection.query(
      `INSERT INTO sale_items (sale_id, product_code, name, qty, price, subtotal) VALUES ?`,
      [itemValues]
    );

    // Update stok produk
    for (const item of items) {
      const [[product]] = await connection.query(
        "SELECT stock, type FROM products WHERE code = ?",
        [item.product_code]
      );

      if (!product) {
        throw new Error(
          `Produk dengan kode ${item.product_code} tidak ditemukan`
        );
      }

      if (product.type === "barang") {
        if (product.stock < item.qty) {
          throw new Error(`Stok tidak cukup untuk ${item.product_code}`);
        }

        await connection.query(
          "UPDATE products SET stock = stock - ? WHERE code = ?",
          [item.qty, item.product_code]
        );
      }
    }

    // Tambahkan cashflow (dengan proteksi duplikat di insertCashflowFromSale)
    await insertCashflowFromSale({
      id: saleId,
      total,
      date,
      invoice_number,
    });

    await connection.commit();

    return {
      id: saleId,
      date,
      items,
      total,
      payment,
      change,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// Ambil semua penjualan
export async function getAllSales() {
  const [rows] = await db.execute("SELECT * FROM sales ORDER BY id DESC");
  return rows;
}

// Ambil detail penjualan by ID
export async function getSaleById(id) {
  const [saleRows] = await db.execute("SELECT * FROM sales WHERE id = ?", [id]);
  if (saleRows.length === 0) return null;

  const [itemRows] = await db.execute(
    "SELECT * FROM sale_items WHERE sale_id = ?",
    [id]
  );

  return { ...saleRows[0], items: itemRows };
}

// Laporan penjualan berdasarkan rentang tanggal
export async function getSalesReport(startDate, endDate) {
  const [rows] = await db.execute(
    `SELECT s.id, s.date, s.total, COUNT(si.id) AS items
     FROM sales s
     LEFT JOIN sale_items si ON s.id = si.sale_id
     WHERE s.date BETWEEN ? AND ?
     GROUP BY s.id
     ORDER BY s.date DESC`,
    [startDate, endDate]
  );
  return rows;
}

// Laporan barang terlaris (top selling)
export async function getTopSellingProducts(month, year, limit = 10) {
  const validMonth = month >= 1 && month <= 12 ? month : new Date().getMonth() + 1;
  const validYear = year >= 2000 ? year : new Date().getFullYear();

  const [rows] = await db.execute(
    `
    SELECT 
      si.product_code,
      p.name,
      SUM(si.qty) AS total_qty
    FROM sale_items si
    JOIN sales s ON s.id = si.sale_id
    JOIN products p ON p.code = si.product_code
    WHERE MONTH(s.date) = ?
      AND YEAR(s.date) = ?
      AND p.type = 'barang'
    GROUP BY si.product_code, p.name
    ORDER BY total_qty DESC
    LIMIT ?
    `,
    [validMonth, validYear, limit]
  );

  return rows;
}


