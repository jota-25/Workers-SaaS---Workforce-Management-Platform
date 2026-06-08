import { getDashboardStats } from "./dashboard.service.js";

export const dashboardStatsHandler = async (req, res, next) => {
  try {
    const stats = await getDashboardStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};