import * as reportModel from "../models/reportModel.js";

export const getDailyReport = async (req, res) => {
  try {
    const date = req.query.date; // format: YYYY-MM-DD
    if (!date) return res.status(400).json({ error: "Date is required" });

    const data = await reportModel.getSalesReportByDate(date);
    const summary = await reportModel.getSalesSummaryByDate(date);

    res.json({ data, summary });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getProductSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query; // type = all | barang | jasa

    if (!startDate || !endDate)
      return res
        .status(400)
        .json({ error: "startDate and endDate are required" });

    const data = await reportModel.getProductSalesReport(
      startDate,
      endDate,
      type
    );

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil laporan per produk" });
  }
};

export const getProfitReport = async (req, res) => {
  try {
    const { startDate, endDate, type = "all" } = req.query;

    const rows = await reportModel.getProfitReport(startDate, endDate, type);

    res.json({ data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil laporan keuntungan" });
  }
};

export const getTopSellingReport = async (req, res) => {
  try {
    const { startDate, endDate, limit = 10, type = "all" } = req.query;

    const data = await reportModel.getTopSellingProducts(
      startDate,
      endDate,
      limit,
      type
    );

    res.json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};
