import db from "../config/db.js";

// GET /api/cashflows?start=YYYY-MM-DD&end=YYYY-MM-DD
export const getCashflows = async (req, res) => {
  const { start, end } = req.query;

  if (!start || !end) {
    return res
      .status(400)
      .json({ message: "Parameter 'start' dan 'end' wajib diisi." });
  }

  try {
    // Ambil data transaksi dalam rentang tanggal
    const [rows] = await db.query(
      `SELECT * FROM cashflows 
       WHERE date BETWEEN ? AND ?
       ORDER BY date ASC`,
      [start, end]
    );

    // Total masuk dan keluar selama periode
    const [[{ total_in }]] = await db.query(
      `SELECT IFNULL(SUM(amount), 0) AS total_in 
       FROM cashflows 
       WHERE type = 'in' AND date BETWEEN ? AND ?`,
      [start, end]
    );

    const [[{ total_out }]] = await db.query(
      `SELECT IFNULL(SUM(amount), 0) AS total_out 
       FROM cashflows 
       WHERE type = 'out' AND date BETWEEN ? AND ?`,
      [start, end]
    );

    // 💰 Hitung saldo awal: total masuk - keluar sebelum tanggal start
    const [[{ saldo_in_awal }]] = await db.query(
      `SELECT IFNULL(SUM(amount), 0) AS saldo_in_awal 
       FROM cashflows 
       WHERE type = 'in' AND date < ?`,
      [start]
    );

    const [[{ saldo_out_awal }]] = await db.query(
      `SELECT IFNULL(SUM(amount), 0) AS saldo_out_awal 
       FROM cashflows 
       WHERE type = 'out' AND date < ?`,
      [start]
    );

    const saldo_awal = saldo_in_awal - saldo_out_awal;
    const saldo_akhir = saldo_awal + total_in - total_out;

    // Kirim response lengkap
    res.json({
      items: rows,
      total_in,
      total_out,
      saldo_awal,
      saldo_akhir,
    });
  } catch (err) {
    console.error("❌ Error in getCashflows:", err);
    res.status(500).json({ message: "Gagal mengambil data cashflow." });
  }
};

// POST /api/cashflows
export const createCashflow = async (req, res) => {
  const { date, description, type, amount, category } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO cashflows (date, description, type, amount, category) 
       VALUES (?, ?, ?, ?, ?)`,
      [date, description, type, amount, category]
    );
    res.json({
      message: "Cashflow berhasil ditambahkan.",
      id: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ message: "Gagal menambahkan cashflow." });
  }
};

// PUT /api/cashflows/:id
export const updateCashflow = async (req, res) => {
  const { id } = req.params;
  const { date, description, type, amount, category } = req.body;

  try {
    await db.query(
      `UPDATE cashflows 
       SET date=?, description=?, type=?, amount=?, category=?
       WHERE id=?`,
      [date, description, type, amount, category, id]
    );
    res.json({ message: "Cashflow berhasil diperbarui." });
  } catch (err) {
    res.status(500).json({ message: "Gagal memperbarui cashflow." });
  }
};

// DELETE /api/cashflows/:id
export const deleteCashflow = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query(`DELETE FROM cashflows WHERE id=?`, [id]);
    res.json({ message: "Cashflow berhasil dihapus." });
  } catch (err) {
    res.status(500).json({ message: "Gagal menghapus cashflow." });
  }
};
