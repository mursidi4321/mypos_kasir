import db from "../config/db.js";

export default {
  /**
   * Buat penyesuaian stok
   * @param {number} product_id - ID produk
   * @param {number} adjustment - Jumlah penyesuaian (+ atau -)
   * @param {string} reason - Alasan penyesuaian
   */
  async create(product_id, adjustment, reason) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // Insert ke tabel stock_adjustments
      await conn.execute(
        `INSERT INTO stock_adjustments (product_id, adjustment, reason) VALUES (?, ?, ?)`,
        [product_id, adjustment, reason]
      );

      // Update stok di tabel products
      await conn.execute(
        `UPDATE products SET stock = stock + ? WHERE id = ?`,
        [adjustment, product_id]
      );

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  },

  /**
   * Ambil semua penyesuaian stok
   * @returns {Promise<Array>}
   */
  async getAll() {
    const [rows] = await db.execute(
      `SELECT sa.id, sa.product_id, p.name, sa.adjustment, sa.reason, sa.created_at
       FROM stock_adjustments sa
       JOIN products p ON p.id = sa.product_id
       ORDER BY sa.created_at DESC`
    );
    return rows;
  },

  /**
   * Ambil total penyesuaian stok untuk sebuah produk
   * @param {number} product_id
   * @returns {Promise<number>}
   */
  async getTotalAdjustment(product_id) {
    const [rows] = await db.execute(
      `SELECT SUM(adjustment) AS totalAdj FROM stock_adjustments WHERE product_id = ?`,
      [product_id]
    );
    return Number(rows[0].totalAdj || 0);
  },
};
