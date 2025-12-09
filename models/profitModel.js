import db from "../config/db.js";

// Hitung total penjualan & HPP per tipe produk
export const getProfitReport = async (startDate, endDate, type = "all") => {
  let params = [startDate, endDate];
  let typeFilter = "";

  if (type !== "all") {
    typeFilter = "AND p.type = ?";
    params.push(type);
  }

  const [rows] = await db.execute(
    `
    SELECT 
      si.product_id,
      p.name AS product_name,
      p.type AS product_type,
      SUM(si.quantity) AS total_qty,
      SUM(si.subtotal) AS total_omzet,
      SUM(si.quantity * p.purchase_price) AS total_hpp,
      SUM(si.subtotal) - SUM(si.quantity * p.purchase_price) AS gross_profit
    FROM sales_items si
    JOIN products p ON si.product_id = p.id
    JOIN sales s ON si.sale_id = s.id
    WHERE DATE(s.created_at) BETWEEN ? AND ?
    ${typeFilter}
    GROUP BY si.product_id
    ORDER BY p.type, p.name
    `,
    params
  );

  return rows;
};
