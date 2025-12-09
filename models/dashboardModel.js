import db from "../config/db.js";

export async function getDashboardData() {
  // Total penjualan bulan ini
  const [salesMonth] = await db.execute(
    `SELECT SUM(total) AS totalSales
     FROM sales
     WHERE MONTH(created_at) = MONTH(CURDATE())
       AND YEAR(created_at) = YEAR(CURDATE())`
  );

  // Total produk terjual bulan ini
  const [productSalesMonth] = await db.execute(
    `SELECT SUM(quantity) AS totalProducts
     FROM sales_items si
     JOIN sales s ON si.sale_id = s.id
     WHERE MONTH(s.created_at) = MONTH(CURDATE())
       AND YEAR(s.created_at) = YEAR(CURDATE())`
  );

  // Total HPP bulan ini
  const [hppMonth] = await db.execute(
    `SELECT SUM(si.quantity * p.purchase_price) AS totalHPP
     FROM sales_items si
     JOIN sales s ON s.id = si.sale_id
     JOIN products p ON p.id = si.product_id
     WHERE MONTH(s.created_at) = MONTH(CURDATE())
       AND YEAR(s.created_at) = YEAR(CURDATE())`
  );

  // Total expense bulan ini
  const [expenseMonth] = await db.execute(
    `SELECT SUM(amount) AS totalExpense
     FROM cashflows
     WHERE MONTH(transaction_date) = MONTH(CURDATE())
       AND YEAR(transaction_date) = YEAR(CURDATE())
       AND type = 'out'
       AND source = 'expense'`
  );

  // Hitung profit = total sales - HPP - expense
  const profit =
    (salesMonth[0].totalSales || 0) -
    (hppMonth[0].totalHPP || 0) -
    (expenseMonth[0].totalExpense || 0);

  // Stok menipis
  const [lowStock] = await db.execute(
    `SELECT COUNT(*) AS lowStock
     FROM products
     WHERE stock <= min_stock`
  );

  // Total nilai stok barang (type='barang')
  const [stockValue] = await db.execute(
    `SELECT SUM(stock * purchase_price) AS totalStockValue
     FROM products
     WHERE type = 'barang'`
  );

  // Top seller barang bulan ini
  const [topSeller] = await db.execute(
    `SELECT p.name AS product_name, SUM(si.quantity) AS total_qty
     FROM sales_items si
     JOIN products p ON p.id = si.product_id
     JOIN sales s ON s.id = si.sale_id
     WHERE MONTH(s.created_at) = MONTH(CURDATE())
       AND YEAR(s.created_at) = YEAR(CURDATE())
       AND p.type = 'barang'
     GROUP BY si.product_id
     ORDER BY total_qty DESC
     LIMIT 1`
  );

  return {
    sales: Number(salesMonth[0].totalSales || 0),
    productSales: Number(productSalesMonth[0].totalProducts || 0),
    profit: Number(profit),
    lowStock: Number(lowStock[0].lowStock || 0),
    stockValue: Number(stockValue[0].totalStockValue || 0),
    topSeller: topSeller[0] || null, // bisa null kalau tidak ada
    period: new Date().toLocaleString("id-ID", {
      month: "long",
      year: "numeric",
    }), // contoh: "Desember 2025"
  };
}
