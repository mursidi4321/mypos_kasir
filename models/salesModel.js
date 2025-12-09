import db from "../config/db.js";
import { insertCashflow } from "./cashflowModel.js";

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

    // Simpan item-item ke tabel sales_items
    const itemValues = items.map((item) => [
      saleId,
      item.product_id,
      item.quantity,
      item.price,
      item.subtotal,
    ]);

    await connection.query(
      `INSERT INTO sales_items (sale_id, product_id, quantity, price, subtotal) VALUES ?`,
      [itemValues]
    );

    // Update stok produk
    for (const item of items) {
      const [[product]] = await connection.query(
        "SELECT stock, type FROM products WHERE id = ?",
        [item.product_id]
      );

      if (!product)
        throw new Error(`Produk dengan ID ${item.product_id} tidak ditemukan`);

      if (product.type === "barang") {
        if (product.stock < item.quantity) {
          throw new Error(
            `Stok tidak cukup untuk produk ID ${item.product_id}`
          );
        }

        await connection.query(
          "UPDATE products SET stock = stock - ? WHERE id = ?",
          [item.quantity, item.product_id]
        );
      }
    }

    // Tambahkan cashflow
    // Tambahkan cashflow otomatis untuk penjualan
    await insertCashflow({
      transaction_date: date,
      type: "in",
      source: "sales",
      description: `Penjualan ${invoice_number}`,
      amount: total,
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
    `SELECT si.*, p.name, p.code 
     FROM sales_items si
     JOIN products p ON si.product_id = p.id
     WHERE si.sale_id = ?`,
    [id]
  );

  return { ...saleRows[0], items: itemRows };
}

// Laporan penjualan berdasarkan rentang tanggal
export async function getSalesReport(startDate, endDate) {
  const [rows] = await db.execute(
    `SELECT s.id, s.date, s.total, COUNT(si.id) AS items
     FROM sales s
     LEFT JOIN sales_items si ON s.id = si.sale_id
     WHERE s.date BETWEEN ? AND ?
     GROUP BY s.id
     ORDER BY s.date DESC`,
    [startDate, endDate]
  );
  return rows;
}

// Laporan barang terlaris (top selling)
export async function getTopSellingProducts(month, year, limit = 10) {
  const validMonth =
    month >= 1 && month <= 12 ? month : new Date().getMonth() + 1;
  const validYear = year >= 2000 ? year : new Date().getFullYear();

  const [rows] = await db.execute(
    `SELECT 
       si.product_id,
       p.name,
       p.code,
       SUM(si.quantity) AS total_qty
     FROM sales_items si
     JOIN sales s ON s.id = si.sale_id
     JOIN products p ON p.id = si.product_id
     WHERE MONTH(s.date) = ?
       AND YEAR(s.date) = ?
       AND p.type = 'barang'
     GROUP BY si.product_id, p.name, p.code
     ORDER BY total_qty DESC
     LIMIT ?`,
    [validMonth, validYear, limit]
  );

  return rows;
}
