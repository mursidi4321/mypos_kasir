import { getProfitReport } from "../models/profitModel.js";

export const profitReportController = async (req, res) => {
  try {
    const { startDate, endDate, type = "all" } = req.query;

    const report = await getProfitReport(startDate, endDate, type);
    console.console.log(report);

    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil laporan profit" });
  }
};
