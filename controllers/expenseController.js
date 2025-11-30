import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../models/expenseModel.js";

export const fetchExpenses = async (req, res) => {
  const { start, end } = req.query;
  try {
    const data = await getExpenses(start, end);
    res.json(data);
  } catch (err) {
    console.error("❌ fetchExpenses", err);
    res.status(500).json({ error: err.message });
  }
};

export const addExpense = async (req, res) => {
  try {
    const id = await createExpense(req.body);
    res.json({ id });
  } catch (err) {
    console.error("❌ addExpense", err);
    res.status(500).json({ error: err.message });
  }
};

export const editExpense = async (req, res) => {
  try {
    await updateExpense(req.params.id, req.body);
    res.json({ ok: true });
  } catch (err) {
    console.error("❌ editExpense", err);
    res.status(500).json({ error: err.message });
  }
};

export const removeExpense = async (req, res) => {
  try {
    await deleteExpense(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error("❌ removeExpense", err);
    res.status(500).json({ error: err.message });
  }
};

// export const getExpenses = async (start, end) => {
//   const [[{ total_expense }]] = await db.query(
//     `SELECT IFNULL(SUM(amount), 0) AS total_expense FROM expenses WHERE date BETWEEN ? AND ?`,
//     [start, end]
//   );
//   return total_expense;
// };
