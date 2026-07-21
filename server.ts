import 'dotenv/config';

import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import { createCoreApp, parsePort, safeErrorLabel } from './src/server/app.js';

const isProduction = process.env.NODE_ENV === 'production';
const isVercel = Boolean(process.env.VERCEL);
const port = parsePort(process.env.PORT);

export async function createApp() {
  const app = createCoreApp();
  if (!isProduction) {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else if (!isVercel) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { dotfiles: 'deny', index: false }));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  }
  return app;
}

export async function startServer() {
  const app = await createApp();
  return app.listen(port, '0.0.0.0', () => console.log(`Server started on port ${port}.`));
}

const isDirectRun = process.argv[1]
  ? fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
  : false;

if (isDirectRun) {
  startServer().catch((error) => {
    console.error('Server failed to start.', { errorType: safeErrorLabel(error) });
    process.exitCode = 1;
  });
}

export default createCoreApp();

export { createCoreApp } from './src/server/app.js';
