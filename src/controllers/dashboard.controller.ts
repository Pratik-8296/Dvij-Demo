import { Request, Response, NextFunction } from 'express';
import * as dashboardService from '../services/dashboard.service';

/**
 * GET /dashboard/stats
 * Returns aggregate statistics for the dashboard.
 */
export async function getDashboardStats(req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await dashboardService.getDashboardStats();
    return res.status(200).json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}
