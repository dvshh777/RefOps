import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { router as apiRouter } from './server/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Mount REST API
  app.use('/api', apiRouter);

  // Mount Vite middleware in development mode or serve static build in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[OROC REFINERY BACKEND] Express REST API running on http://localhost:${PORT}`);
    console.log(`[OROC REFINERY BACKEND] PostgreSQL simulation engine initialized.`);
    console.log(`[OROC REFINERY BACKEND] Redis pub/sub telemetry cache initialized.`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
