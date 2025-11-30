// models/purchaseModel.js
import db from "../config/db.js";

import { insertCashflowFromPurchase } from "../models/cashflowModel.js";

export async function createPurchase(supplier, invoice, total, items) {
  const connection = await db.getConnection(); // ambil koneksi baru dari pool
  try {
    await connection.beginTransaction();

    // Insert ke purchases
    const [result] = await connection.execute(
      "INSERT INTO purchases (supplier, invoice, total, created_at) VALUES (?, ?, ?, NOW())",
      [supplier, invoice, total]
    );
    const purchaseId = result.insertId;

    // Insert setiap item pembelian
    for (const item of items) {
      await connection.execute(
        "INSERT INTO purchase_items (purchase_id, product_id, quantity, buy_price) VALUES (?, ?, ?, ?)",
        [purchaseId, item.product_id, item.quantity, item.buy_price]
      );

      // Update stok produk
      await connection.execute(
        "UPDATE products SET stock = stock + ? WHERE id = ?",
        [item.quantity, item.product_id]
      );

      // tambahkan di cashflow
      // Tambahkan cashflow (dengan proteksi duplikat di insertCashflowFromSale)
      const date = new Date();
      await insertCashflowFromPurchase({
        id: purchaseId,
        total,
        date: date,
        invoice_number : invoice,
      });
    }

    await connection.commit();

    return purchaseId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release(); // jangan lupa release koneksi ke pool
  }
}

export async function getAllPurchases() {
  const [rows] = await db.execute(
    "SELECT * FROM purchases ORDER BY created_at DESC"
  );
  return rows;
}

export async function getPurchaseById(id) {
  const [rows] = await db.execute("SELECT * FROM purchases WHERE id = ?", [id]);
  return rows[0];
}

export async function deletePurchase(id) {
  const [result] = await db.execute("DELETE FROM purchases WHERE id = ?", [id]);
  return result;
}

export async function getPurchaseReport(start, end, supplier = "all") {
  let query = `
    SELECT 
      p.id,
      p.created_at AS date,
      p.supplier,
      p.invoice,
      i.quantity,
      i.buy_price,
      pr.name AS product_name
    FROM purchase_items i
    JOIN purchases p ON i.purchase_id = p.id
    JOIN products pr ON i.product_id = pr.id
    WHERE DATE(p.created_at) BETWEEN ? AND ?
  `;

  const params = [start, end];

  if (supplier !== "all") {
    query += ` AND p.supplier = ?`;
    params.push(supplier);
  }

  query += ` ORDER BY p.created_at DESC`;

  const [rows] = await db.execute(query, params);
  return rows;
}

