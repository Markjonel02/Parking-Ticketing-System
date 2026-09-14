import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createApp } from './server/src/app.js';
import { startOverdueTicketsScheduler } from './server/src/jobs/overdueTicketsJob.js';

async function startServer() {
  const app = createApp();
  const PORT = 3000;

  // Start background jobs
  startOverdueTicketsScheduler(120000);

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

startServer();
