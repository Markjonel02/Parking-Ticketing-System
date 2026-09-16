// server/src/controllers/reportController.js
import { ReportService } from '../services/reportService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export class ReportController {
  static getDashboardStats = asyncHandler(async (req, res) => {
    const stats = await ReportService.getDashboardMetrics();
    return res.json({ success: true, data: stats });
  });

  static getTicketReports = asyncHandler(async (req, res) => {
    const report = await ReportService.getTicketReports(req.query);
    return res.json({ success: true, data: report });
  });

  static getPaymentReports = asyncHandler(async (req, res) => {
    const report = await ReportService.getPaymentReports(req.query);
    return res.json({ success: true, data: report });
  });

  static getRevenueReports = asyncHandler(async (req, res) => {
    const report = await ReportService.getRevenueReports();
    return res.json({ success: true, data: report });
  });
}

export default ReportController;
