import db from "../config/db.js";

// Tambah arus kas
export async function insertCashflow(data) {
  const [result] = await db.execute(
    `INSERT INTO cashflows 
     (type, source, amount, description, transaction_date)
     VALUES (?, ?, ?, ?, ?)`,
    [
      data.type,
      data.source,
      data.amount,
      data.description,
      data.transaction_date,
    ]
  );
  return result.insertId;
}

// Ambil semua cashflow dengan filter tanggal opsional
export async function getAllCashflows({ start_date, end_date } = {}) {
  let query = "SELECT * FROM cashflows WHERE 1=1";
  const params = [];

  if (start_date) {
    query += " AND transaction_date >= ?";
    params.push(start_date);
  }
  if (end_date) {
    query += " AND transaction_date <= ?";
    params.push(end_date);
  }

  query += " ORDER BY transaction_date DESC";

  const [rows] = await db.execute(query, params);

  return rows;
}

// Hitung saldo kas
export async function getCashBalance() {
  const [rows] = await db.execute(
    `SELECT 
       SUM(CASE WHEN type='in' THEN amount ELSE 0 END) AS total_in,
       SUM(CASE WHEN type='out' THEN amount ELSE 0 END) AS total_out
     FROM cashflows`
  );

  const { total_in = 0, total_out = 0 } = rows[0];
  return {
    total_in: parseFloat(total_in),
    total_out: parseFloat(total_out),
    balance: parseFloat(total_in) - parseFloat(total_out),
  };
}

export async function getCashflowsWithSaldo(start_date, end_date) {
  const [saldoRows] = await db.execute(
    `SELECT
       SUM(CASE WHEN type='in' THEN amount ELSE 0 END) -
       SUM(CASE WHEN type='out' THEN amount ELSE 0 END) AS saldo_awal
     FROM cashflows
     WHERE transaction_date < ?`,
    [start_date]
  );
  const saldo_awal = saldoRows[0]?.saldo_awal || 0;

  const [items] = await db.execute(
    `SELECT
        id,
        transaction_date,
        type,
        source,          -- KOLOM INI WAJIB
        description,
        amount
     FROM cashflows
     WHERE transaction_date BETWEEN ? AND ?
     ORDER BY transaction_date ASC`,
    [start_date, end_date]
  );

  return { saldo_awal, items };
}
