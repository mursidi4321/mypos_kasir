import db from "../config/db.js";


// Ambil semua cashflow antara dua tanggal dan hitung saldo
export const findAllCashflows = async (start, end) => {
  const [rows] = await db.execute(
    `SELECT * FROM cashflows 
     WHERE date BETWEEN ? AND ?
     ORDER BY date ASC`,
    [start, end]
  );

  const [[{ total_in }]] = await db.execute(
    `SELECT IFNULL(SUM(amount), 0) AS total_in 
     FROM cashflows 
     WHERE type = 'in' AND date BETWEEN ? AND ?`,
    [start, end]
  );

  const [[{ total_out }]] = await db.execute(
    `SELECT IFNULL(SUM(amount), 0) AS total_out 
     FROM cashflows 
     WHERE type = 'out' AND date BETWEEN ? AND ?`,
    [start, end]
  );

  const [[{ saldo_awal }]] = await db.execute(
    `SELECT
       IFNULL(SUM(CASE WHEN type = 'in' THEN amount ELSE 0 END), 0) -
       IFNULL(SUM(CASE WHEN type = 'out' THEN amount ELSE 0 END), 0) AS saldo_awal
     FROM cashflows
     WHERE date < ?`,
    [start]
  );

  const saldo_akhir = saldo_awal + total_in - total_out;

  return {
    items: rows,
    total_in,
    total_out,
    saldo_awal,
    saldo_akhir,
  };
};

// Tambah data cashflow manual
export const insertCashflow = async ({
  date,
  description,
  type,
  amount,
  category,
}) => {
  const [result] = await db.execute(
    `INSERT INTO cashflows (date, description, type, amount, category) 
     VALUES (?, ?, ?, ?, ?)`,
    [date, description, type, amount, category]
  );
  return result.insertId;
};

// Update cashflow manual
export const updateCashflowById = async (
  id,
  { date, description, type, amount, category }
) => {
  await db.execute(
    `UPDATE cashflows 
     SET date = ?, description = ?, type = ?, amount = ?, category = ? 
     WHERE id = ?`,
    [date, description, type, amount, category, id]
  );
};

// Hapus cashflow
export const deleteCashflowById = async (id) => {
  await db.execute(`DELETE FROM cashflows WHERE id = ?`, [id]);
};

// Tambah cashflow otomatis dari penjualan
export const insertCashflowFromSale = async ({ id, total, date, invoice_number }) => {
  const [[existing]] = await db.execute(
    `SELECT id FROM cashflows 
     WHERE related_type = 'penjualan' AND related_id = ?`,
    [id]
  );

  if (existing) return;

  await db.execute(
    `INSERT INTO cashflows 
      (date, description, type, amount, category, related_type, related_id)
     VALUES (?, ?, 'in', ?, 'penjualan', 'penjualan', ?)`,
    [date, `Penjuaan No.Nota: ${invoice_number}`, total, id]
  );
};

// Tambah cashflow otomatis dari pembelian
export const insertCashflowFromPurchase = async ({ id, total, date, invoice_number }) => {
  const [[existing]] = await db.execute(
    `SELECT id FROM cashflows 
     WHERE related_type = 'pembelian' AND related_id = ?`,
    [id]
  );

  if (existing) return;

  await db.execute(
    `INSERT INTO cashflows 
      (date, description, type, amount, category, related_type, related_id)
     VALUES (?, ?, 'out', ?, 'pembelian', 'pembelian', ?)`,
    [date, `Pembelian No.Nota: ${invoice_number}`, total, id]
  );
};
