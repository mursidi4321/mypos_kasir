import db from "../config/db.js"; // pastikan koneksi MySQL

export const getSalesReportByDate = async (date) => {
  const query = `
    SELECT 
      s.invoice_number,
      s.date,
      p.name AS product_name,
      si.quantity,
      si.price,
      (si.quantity * si.price) AS subtotal
    FROM sales s
    JOIN sales_items si ON s.id = si.sale_id
    JOIN products p ON si.product_id = p.id
    WHERE DATE(s.date) = ?
    ORDER BY s.date ASC
  `;
  const [rows] = await db.execute(query, [date]);
  return rows;
};

export const getSalesSummaryByDate = async (date) => {
  const query = `
    SELECT 
      SUM(si.quantity * si.price) AS total_sales,
      SUM(si.quantity) AS total_qty
    FROM sales s
    JOIN sales_items si ON s.id = si.sale_id
    WHERE DATE(s.date) = ?
  `;
  const [rows] = await db.execute(query, [date]);
  return rows[0] || { total_sales: 0, total_qty: 0 };
};

export const getProductSalesReport = async (
  startDate,
  endDate,
  productType
) => {
  let filterQuery = "";
  const params = [startDate, endDate];

  // Jika productType = barang / jasa
  if (productType && productType !== "all") {
    filterQuery = " AND p.type = ? ";
    params.push(productType);
  }

  const query = `
    SELECT 
      p.id AS product_id,
      p.name AS product_name,
      p.type AS product_type,
      SUM(si.quantity) AS total_qty,
      SUM(si.subtotal) AS total_sales
    FROM sales_items si
    JOIN products p ON si.product_id = p.id
    JOIN sales s ON si.sale_id = s.id
    WHERE DATE(s.date) BETWEEN ? AND ?
      ${filterQuery}
    GROUP BY si.product_id
    ORDER BY total_qty DESC
  `;

  const [rows] = await db.execute(query, params);

  return rows;
};

// LAPORAN KEUNTUNGAN
export const getProfitReport = async (startDate, endDate, type) => {
  let filterType = "";
  let params = [startDate, endDate];

  if (type !== "all") {
    filterType = "AND p.type = ?";
    params.push(type);
  }

  const query = `
    SELECT 
      p.id AS product_id,
      p.name AS product_name,
      p.type AS product_type,
      SUM(si.quantity) AS total_qty,
      SUM(si.subtotal) AS total_omzet,
      SUM(si.quantity * p.purchase_price) AS total_modal,
      (SUM(si.subtotal) - SUM(si.quantity * p.purchase_price)) AS total_profit
    FROM sales_items si
    JOIN products p ON si.product_id = p.id
    JOIN sales s ON si.sale_id = s.id
    WHERE s.date BETWEEN ? AND ?
    ${filterType}
    GROUP BY p.id
    ORDER BY total_profit DESC
  `;

  const [rows] = await db.execute(query, params);
  return rows;
};

export const getTopSellingProducts = async (
  startDate,
  endDate,
  limit = 10,
  type = "all"
) => {
  const params = [startDate, endDate];

  let typeFilter = "";
  if (type !== "all") {
    typeFilter = "AND p.type = ?";
    params.push(type);
  }

  const [rows] = await db.execute(
    `
    SELECT 
      p.id AS product_id,
      p.code,
      p.name,
      SUM(si.quantity) AS total_qty,
      SUM(si.subtotal) AS total_sales
    FROM sales s
    JOIN sales_items si ON s.id = si.sale_id
    JOIN products p ON p.id = si.product_id
    WHERE DATE(s.date) BETWEEN ? AND ?
      ${typeFilter}
    GROUP BY p.id, p.code, p.name
    ORDER BY total_qty DESC
    LIMIT ${limit}
    `,
    params
  );

  return rows;
};
