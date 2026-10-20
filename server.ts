import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isTsxLoaded = 
  process.execArgv.some(arg => arg.includes('tsx')) || 
  process.env.TSX_LOADED === 'true';

if (!isTsxLoaded) {
  // Re-launch with tsx loader so TypeScript files with .js import specifiers resolve correctly
  const child = spawn(process.execPath, ['--import', 'tsx', __filename], {
    stdio: 'inherit',
    env: { ...process.env, TSX_LOADED: 'true' }
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
    }
    process.exit(code ?? 0);
  });
} else {
  startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

async function startServer() {
  const express = (await import('express')).default;
  const { router: apiRouter } = await import('./server/routes.js');
  const { connectMongoDB } = await import('./server/mongoDb.js');

  await connectMongoDB();

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
    console.log(`[OROC REFINERY BACKEND] MongoDB BSON Document Store Engine active.`);
    console.log(`[OROC REFINERY BACKEND] Redis pub/sub telemetry cache initialized.`);
  });
}

