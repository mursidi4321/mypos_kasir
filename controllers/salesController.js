import {
  createSale,
  getAllSales,
  getSaleById,
  getSalesReport,
} from "../models/salesModel.js";

// Simpan penjualan + cashflow sudah di-handle di model
export const saveSale = async (req, res) => {
  try {
    const data = req.body;

    if (!data.items || data.items.length === 0) {
      return res.status(400).json({ message: "Tidak ada item penjualan" });
    }

    const sale = await createSale(data); // Buat penjualan + update stok + cashflow

    res.status(201).json({
      message: "Penjualan berhasil disimpan",
      sale,
    });
  } catch (error) {
    console.error("❌ Gagal menyimpan penjualan:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/sales
export const fetchSales = async (req, res) => {
  try {
    const sales = await getAllSales();
    res.json(sales);
  } catch (error) {
    console.error("❌ Gagal mengambil data penjualan:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/sales/:id
export const fetchSaleById = async (req, res) => {
  try {
    const id = req.params.id;
    const sale = await getSaleById(id);

    if (!sale) {
      return res.status(404).json({ message: "Penjualan tidak ditemukan" });
    }

    res.json(sale);
  } catch (error) {
    console.error("❌ Gagal mengambil detail penjualan:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/sales/report?start=YYYY-MM-DD&end=YYYY-MM-DD
export const fetchSalesReport = async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ message: "Harap sertakan start dan end date" });
    }

    const report = await getSalesReport(start, end);
    res.json(report);
  } catch (error) {
    console.error("❌ Gagal mengambil laporan penjualan:", error);
    res.status(500).json({ message: error.message });
  }
};
