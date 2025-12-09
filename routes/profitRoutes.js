import express from "express";
import { profitReportController } from "../controllers/profitController.js";

const router = express.Router();

router.get("/profit", profitReportController);

export default router;
