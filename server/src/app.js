// server/src/app.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { corsOptions } from './config/cors.js';
import { rateLimiter } from './middleware/rateLimitMiddleware.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';
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
import { getDatabaseStatus } from './config/database.js';
import { asyncHandler } from './utils/asyncHandler.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(cors(corsOptions));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use('/api', rateLimiter);

  const uploadsPath = path.join(process.cwd(), 'server', 'uploads', 'receipts');
  app.use('/uploads/receipts', express.static(uploadsPath));

  app.get('/api/health', (req, res) => {
    const dbStatus = getDatabaseStatus();
    res.status(dbStatus.isConnected ? 200 : 503).json({
      status: dbStatus.isConnected ? 'operational' : 'degraded',
      service: 'ParkGuard Citation Management API',
      database: dbStatus,
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/tickets', ticketRoutes);
  app.use('/api/vehicles', vehicleRoutes);
  app.use('/api/violations', violationRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/parking', parkingRoutes);

  app.get(
    '/api/audit-logs',
    authenticate,
    asyncHandler(async (req, res) => {
      const { data, pagination } = await AuditService.getRecentLogs(req.query);
      res.json({ success: true, data, pagination });
    }),
  );

  app.use('/api', notFoundHandler);
  app.use(errorHandler);

  return app;
}
