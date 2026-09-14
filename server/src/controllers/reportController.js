// server/src/controllers/reportController.js
import { ReportService } from '../services/reportService.js';

export class ReportController {
  static async getDashboardStats(req, res, next) {
    try {
      const stats = ReportService.getDashboardMetrics();
      return res.json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  }

  static async getTicketReports(req, res, next) {
    try {
      const report = ReportService.getTicketReports(req.query);
      return res.json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  static async getPaymentReports(req, res, next) {
    try {
      const report = ReportService.getPaymentReports(req.query);
      return res.json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }

  static async getRevenueReports(req, res, next) {
    try {
      const report = ReportService.getRevenueReports();
      return res.json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }
}
