import db from "../config/db.js";

// Dashboard Summary
export const getDashboardData = async () => {
  const [[{ sales }]] = await db.query(
    `SELECT IFNULL(SUM(total),0) AS sales FROM sales`
  );
  const [[{ purchases }]] = await db.query(
    `SELECT IFNULL(SUM(total),0) AS purchases FROM purchases`
  );
  const [[{ lowStock }]] = await db.query(
    `SELECT COUNT(*) AS lowStock FROM products WHERE stock <= min_stock`
  );
  const profit = sales - purchases;
  return { sales, purchases, profit, lowStock };
};

// Sales Report per date range
export const getSalesData = async (start, end) => {
  const [rows] = await db.query(
    `SELECT 
       s.id, 
       s.date, 
       s.invoice_number,
       s.total, 
       s.payment, 
       s.change_amount,
       COUNT(si.id) AS items
     FROM sales s
     LEFT JOIN sale_items si ON s.id = si.sale_id
     WHERE DATE(s.date) BETWEEN ? AND ?
     GROUP BY s.id
     ORDER BY s.date DESC`,
    [start, end]
  );
  return rows;
};

// Profit Loss Report per date range
export const getProfitLossData = async (start, end) => {
  const [[{ sales }]] = await db.query(
    `SELECT IFNULL(SUM(total), 0) AS sales 
     FROM sales 
     WHERE date BETWEEN ? AND ?`,
    [start, end]
  );

  const [[{ cost }]] = await db.query(
    `SELECT IFNULL(SUM(p.purchase_price * sd.qty), 0) AS cost
     FROM sale_details sd
     JOIN products p ON sd.product_code = p.code
     JOIN sales s ON sd.sale_id = s.id
     WHERE s.date BETWEEN ? AND ?`,
    [start, end]
  );

  return { sales, cost };
};

export const getProfitLoss = async (start, end) => {
  const [rows] = await db.execute(
    `
    SELECT 
      si.product_code,
      si.name,
      p.price,
      p.purchase_price,
      SUM(si.qty) AS qty,
      SUM(si.qty * p.price) AS total_sales,
      SUM(si.qty * p.purchase_price) AS total_cost,
      SUM(si.qty * (p.price - p.purchase_price)) AS profit
    FROM sale_items si
    JOIN products p ON si.product_code = p.code
    JOIN sales s ON si.sale_id = s.id
    WHERE DATE(s.date) BETWEEN ? AND ?
    GROUP BY si.product_code
    ORDER BY si.name ASC
    `,
    [start, end]
  );

  let total_sales = 0;
  let total_cost = 0;
  let profit = 0;

  for (const item of rows) {
    total_sales += parseFloat(item.total_sales) || 0;
    total_cost += parseFloat(item.total_cost) || 0;
    profit += parseFloat(item.profit) || 0;
  }

  // 🔽 Ambil total biaya operasional
  const [[{ expense }]] = await db.query(
    `SELECT IFNULL(SUM(amount), 0) AS expense 
     FROM expenses 
     WHERE date BETWEEN ? AND ?`,
    [start, end]
  );

  const net_profit = profit - parseFloat(expense);

  return {
    start,
    end,
    total_sales,
    total_cost,
    expense,
    profit: net_profit,
    details: rows,
  };
};

// Purchase Report per date range
export const getPurchaseData = async (start, end) => {
  const [rows] = await db.query(
    `SELECT p.id, p.date, p.supplier, p.total, COUNT(pd.id) AS items
     FROM purchases p
     LEFT JOIN purchase_details pd ON p.id = pd.purchase_id
     WHERE p.date BETWEEN ? AND ?
     GROUP BY p.id
     ORDER BY p.date DESC`,
    [start, end]
  );
  return rows;
};

// Stock Report: all products with current stock
export const getStockData = async () => {
  const [rows] = await db.query(
    `SELECT id, code, name, stock, min_stock, price, purchase_price
     FROM products
     ORDER BY stock ASC`
  );
  return rows;
};

export const getLowStockProducts = async () => {
  const [rows] = await db.query(
    `SELECT 
       id, code, name, stock, min_stock, price, purchase_price
     FROM products
     WHERE stock <= min_stock
     ORDER BY stock ASC`
  );
  return rows;
};
