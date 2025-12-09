import {
  getAllProducts,
  getStockIn,
  getStockOut,
  getStockInBefore,
  getStockOutBefore,
  getLastBuyPrice
} from "../models/stockReportModel.js";

export async function getStockReport(req, res) {
  try {
    const { start, end } = req.query;

    const products = await getAllProducts();
    const report = [];

    for (const p of products) {
      const productId = p.id;

      const stockIn = await getStockIn(productId, start, end);
      const stockOut = await getStockOut(productId, start, end);

      const beforeIn = await getStockInBefore(productId, start);
      const beforeOut = await getStockOutBefore(productId, start);

      const stokAwal = beforeIn - beforeOut;
      const stokAkhir = stokAwal + stockIn - stockOut;

      const lastBuyPrice = await getLastBuyPrice(productId);
      const inventoryValue = stokAkhir * lastBuyPrice;

      report.push({
        product_id: productId,
        name: p.name,
        stokAwal,
        stockIn,
        stockOut,
        stokAkhir,
        lastBuyPrice,
        inventoryValue
      });
    }

    res.json(report);
  } catch (err) {
    console.error("StockReport ERROR:", err);
    res.status(500).json({ message: "Error generating stock report" });
  }
}
