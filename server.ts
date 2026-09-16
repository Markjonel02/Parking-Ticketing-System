import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createApp } from './server/src/app.js';
import { connectDB } from './server/src/config/database.js';
import { startOverdueTicketsScheduler } from './server/src/jobs/overdueTicketsJob.js';
import { startReportCleanupScheduler } from './server/src/jobs/reportCleanupJob.js';

async function startServer() {
  // Fail fast if MongoDB is unreachable rather than serving an app that
  // silently has no data.
  await connectDB();

  const app = createApp();
  const PORT = 3000;

  // Start background jobs
  startOverdueTicketsScheduler(120000);
  startReportCleanupScheduler(3600000);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ParkGuard Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error during server startup — is MongoDB reachable at MONGODB_URI?', err);
  process.exit(1);
});
