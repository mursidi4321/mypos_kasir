import db from "../config/db.js";
import {
  insertCashflow,
  getAllCashflows,
  getCashflowsWithSaldo,
  getCashBalance,
} from "../models/cashflowModel.js";

// Ambil daftar cashflow dengan filter tanggal
export async function getCashflow(req, res) {
  try {
    const { start_date, end_date } = req.query;

    if (start_date && end_date) {
      // Gunakan saldo_awal + item per tanggal
      const result = await getCashflowsWithSaldo(start_date, end_date);
      return res.json({ success: true, data: result });
    }

    // Jika tidak ada filter, ambil semua cashflow
    const items = await getAllCashflows();

    return res.json({ success: true, data: { items } });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Gagal mengambil data cashflow" });
  }
}

// Ambil saldo kas total
export async function getBalance(req, res) {
  try {
    const balance = await getCashBalance();
    res.json({ success: true, data: balance });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Gagal mengambil saldo kas" });
  }
}

// Tambah cashflow baru
export async function addCashflow(req, res) {
  try {
    const { type, source, amount, description, transaction_date } = req.body;

    if (!type || !source || !amount || !transaction_date) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Field wajib: type, source, amount, transaction_date",
        });
    }

    const id = await insertCashflow({
      type,
      source,
      amount,
      description,
      transaction_date,
    });
    res.json({ success: true, id });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Gagal menambahkan cashflow" });
  }
}

// Edit cashflow
export async function updateCashflow(req, res) {
  try {
    const { id } = req.params;
    const { type, source, amount, description, transaction_date } = req.body;

    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "ID cashflow dibutuhkan" });

    // Update menggunakan query manual
    const fields = [];
    const values = [];

    if (type) {
      fields.push("type = ?");
      values.push(type);
    }
    if (source) {
      fields.push("source = ?");
      values.push(source);
    }
    if (amount !== undefined) {
      fields.push("amount = ?");
      values.push(amount);
    }
    if (description !== undefined) {
      fields.push("description = ?");
      values.push(description);
    }
    if (transaction_date) {
      fields.push("transaction_date = ?");
      values.push(transaction_date);
    }

    if (fields.length === 0)
      return res
        .status(400)
        .json({ success: false, message: "Tidak ada field yang diupdate" });

    const [result] = await db.execute(
      `UPDATE cashflows SET ${fields.join(", ")} WHERE id = ?`,
      [...values, id]
    );

    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Gagal mengupdate cashflow" });
  }
}

// Hapus cashflow
export async function deleteCashflow(req, res) {
  try {
    const { id } = req.params;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "ID cashflow dibutuhkan" });

    const [result] = await db.execute("DELETE FROM cashflows WHERE id = ?", [
      id,
    ]);

    res.json({ success: true, affectedRows: result.affectedRows });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Gagal menghapus cashflow" });
  }
}
