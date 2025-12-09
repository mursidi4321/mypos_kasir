import { getDashboardData } from "../models/dashboardModel.js";

export async function dashboardController(req, res) {
  try {
    const data = await getDashboardData();
    res.json({ success: true, data });
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
