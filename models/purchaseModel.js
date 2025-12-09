// models/purchaseModel.js
import db from "../config/db.js";
import { insertCashflow } from "./cashflowModel.js";

export async function createPurchase(supplier, invoice_number, total, items) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Insert ke purchases
    const [result] = await connection.execute(
      `INSERT INTO purchases (supplier, invoice_number, total, created_at)
       VALUES (?, ?, ?, NOW())`,
      [supplier, invoice_number, total]
    );

    const purchaseId = result.insertId;

    // 2. Insert purchase items + update stok
    for (const item of items) {
      await connection.execute(
        `INSERT INTO purchase_items 
          (purchase_id, product_id, name, qty, buy_price)
         VALUES (?, ?, ?, ?, ?)`,
        [purchaseId, item.product_id, item.name, item.qty, item.buy_price]
      );

      await connection.execute(
        `UPDATE products SET stock = stock + ? WHERE id = ?`,
        [item.qty, item.product_id]
      );
    }

    // 3. Ambil created_at dari purchase sebagai tanggal cashflow
    const [dateRow] = await connection.execute(
      `SELECT DATE(created_at) AS date FROM purchases WHERE id = ?`,
      [purchaseId]
    );

    const transactionDate = dateRow[0].date;

    // 4. Insert cashflow otomatis
    await insertCashflow({
      transaction_date: transactionDate, // ⬅ Pakai tanggal real dari purchase
      type: "out",
      source: "purchase",
      description: `Pembelian #${invoice_number}`,
      amount: total,
      ref_id: purchaseId, // untuk menghapus cashflow otomatis
      ref_type: "purchase",
    });

    await connection.commit();
    return purchaseId;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

export async function getAllPurchases() {
  const [rows] = await db.execute(
    `SELECT id, supplier, invoice_number, total, created_at
     FROM purchases
     ORDER BY created_at DESC`
  );
  return rows;
}

export async function getPurchaseById(id) {
  const [rows] = await db.execute(
    `SELECT 
      p.id,
      p.supplier,
      p.invoice_number,
      p.total,
      p.created_at,
      i.product_id,
      i.qty,
      i.buy_price,
      pr.name AS product_name,
      pr.code AS product_code
    FROM purchases p
    LEFT JOIN purchase_items i ON p.id = i.purchase_id
    LEFT JOIN products pr ON i.product_id = pr.id
    WHERE p.id = ?`,
    [id]
  );
  return rows;
}

export async function deletePurchase(id) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Rollback stok
    const [items] = await connection.execute(
      `SELECT product_id, qty FROM purchase_items WHERE purchase_id = ?`,
      [id]
    );

    for (const item of items) {
      await connection.execute(
        `UPDATE products SET stock = stock - ? WHERE id = ?`,
        [item.qty, item.product_id]
      );
    }

    // 2. Hapus purchase_items
    await connection.execute(
      `DELETE FROM purchase_items WHERE purchase_id = ?`,
      [id]
    );

    // 3. Hapus purchase
    await connection.execute(`DELETE FROM purchases WHERE id = ?`, [id]);

    // 4. Hapus cashflow terkait purchase
    await connection.execute(
      `DELETE FROM cashflows WHERE ref_type = 'purchase' AND ref_id = ?`,
      [id]
    );

    await connection.commit();
    return true;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

export async function getPurchaseReport(start, end, supplier = "all") {
  let sql = `
    SELECT
      p.id,
      DATE(p.created_at) as date,
      p.supplier,
      p.invoice_number,
      i.product_id,
      pr.name AS product_name,
      pr.code AS product_code,
      i.qty,
      i.buy_price,
      (i.qty * i.buy_price) AS subtotal
    FROM purchases p
    JOIN purchase_items i ON p.id = i.purchase_id
    JOIN products pr ON i.product_id = pr.id
    WHERE DATE(p.created_at) BETWEEN ? AND ?
  `;

  const params = [start, end];

  if (supplier !== "all") {
    sql += ` AND p.supplier = ?`;
    params.push(supplier);
  }

  sql += ` ORDER BY p.created_at DESC`;

  const [rows] = await db.execute(sql, params);
  return rows;
}
