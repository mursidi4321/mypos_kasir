import db from "../config/db.js";

export default {
  /**
   * Buat penyesuaian stok baru
   * @param {number} product_id
   * @param {number} adjustment - jumlah penyesuaian (positif/negatif)
   * @param {string} reason - alasan penyesuaian
   */
  async create(product_id, adjustment, reason) {
    const query = `
      INSERT INTO stock_adjustments (product_id, adjustment, reason)
      VALUES (?, ?, ?)
    `;
    await db.execute(query, [product_id, adjustment, reason]);
  },

  /**
   * Ambil semua penyesuaian stok
   * @returns {Promise<Array>}
   */
  async getAll() {
    const query = `
      SELECT sa.id, sa.product_id, p.name AS product_name, sa.adjustment, sa.reason, sa.created_at
      FROM stock_adjustments sa
      JOIN products p ON sa.product_id = p.id
      ORDER BY sa.created_at DESC
    `;
    const [rows] = await db.execute(query);
    return rows;
  },

  /**
   * Ambil total penyesuaian stok untuk suatu produk
   * @param {number} product_id
   * @returns {Promise<number>}
   */
  async getTotalAdjustment(product_id) {
    const query = `
      SELECT SUM(adjustment) AS totalAdj
      FROM stock_adjustments
      WHERE product_id = ?
    `;
    const [rows] = await db.execute(query, [product_id]);
    return rows[0].totalAdj || 0;
  }
};
