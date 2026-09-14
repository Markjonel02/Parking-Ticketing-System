// server/src/app.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { corsOptions } from './config/cors.js';
import { rateLimiter } from './middleware/rateLimitMiddleware.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { authRoutes } from './routes/authRoutes.js';
import { ticketRoutes } from './routes/ticketRoutes.js';
import { vehicleRoutes } from './routes/vehicleRoutes.js';
import { violationRoutes } from './routes/violationRoutes.js';
import { paymentRoutes } from './routes/paymentRoutes.js';
import { reportRoutes } from './routes/reportRoutes.js';
import { userRoutes } from './routes/userRoutes.js';
import { parkingRoutes } from './routes/parkingRoutes.js';
import { AuditService } from './services/auditService.js';
import { authenticate } from './middleware/authMiddleware.js';

export function createApp() {
  const app = express();

  // Basic security and parsing
  app.use(cors(corsOptions));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use('/api', rateLimiter);

  // Receipts static folder
  const uploadsPath = path.join(process.cwd(), 'server', 'uploads', 'receipts');
  app.use('/uploads/receipts', express.static(uploadsPath));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'operational',
      service: 'ParkGuard Citation Management API',
      timestamp: new Date().toISOString(),
      version: '2.4.0-enterprise'
    });
  });

  // Core API Endpoints
  app.use('/api/auth', authRoutes);
  app.use('/api/tickets', ticketRoutes);
  app.use('/api/vehicles', vehicleRoutes);
  app.use('/api/violations', violationRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/parking', parkingRoutes);

  // Audit trail endpoint
  app.get('/api/audit-logs', authenticate, (req, res) => {
    const logs = AuditService.getRecentLogs(req.query);
    res.json({ success: true, data: logs });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
}
