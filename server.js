// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import productRoutes from "./routes/productRoutes.js";
import saleRoutes from "./routes/saleRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import cashflowRoutes from "./routes/cashflowRoutes.js";

import uploadRoutes from "./routes/uploadRoutes.js";

dotenv.config();

const app = express();

// Untuk ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());

// ==========================
// SERVE STATIC UPLOAD FOLDER
// ==========================
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/upload", uploadRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/cashflows", cashflowRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.send("🚀 POS API with Node.js and Express is running");
});

// Run server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
