import db from "../config/db.js";

export const getExpenses = async (start, end) => {
  const [rows] = await db.query(
    `SELECT id, date, description, amount
     FROM expenses WHERE date BETWEEN ? AND ?
     ORDER BY date DESC`,
    [start, end]
  );
  const [[{ total_expense }]] = await db.query(
    `SELECT IFNULL(SUM(amount), 0) AS total_expense
     FROM expenses WHERE date BETWEEN ? AND ?`,
    [start, end]
  );
  return { items: rows, total_expense };
};

export const createExpense = async ({ date, description, amount }) => {
  const [result] = await db.query(
    `INSERT INTO expenses (date, description, amount) VALUES (?, ?, ?)`,
    [date, description, amount]
  );
  return result.insertId;
};

export const updateExpense = async (id, { date, description, amount }) => {
  await db.query(
    `UPDATE expenses SET date=?, description=?, amount=? WHERE id=?`,
    [date, description, amount, id]
  );
};

export const deleteExpense = async (id) => {
  await db.query(`DELETE FROM expenses WHERE id = ?`, [id]);
};
