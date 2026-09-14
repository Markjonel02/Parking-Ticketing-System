// server/src/routes/reportRoutes.js
import { Router } from 'express';
import { ReportController } from '../controllers/reportController.js';
import { authenticate } from '../middleware/authMiddleware.js';

export const reportRoutes = Router();

reportRoutes.get('/dashboard', authenticate, ReportController.getDashboardStats);
reportRoutes.get('/tickets', authenticate, ReportController.getTicketReports);
reportRoutes.get('/payments', authenticate, ReportController.getPaymentReports);
reportRoutes.get('/revenue', authenticate, ReportController.getRevenueReports);
