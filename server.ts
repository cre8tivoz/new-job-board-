import 'dotenv/config';

import express, { type NextFunction, type Request, type Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { toNodeHandler } from 'better-auth/node';
import { createServer as createViteServer } from 'vite';
import { createAuth, type Cre8tivAuth } from './src/server/auth.js';
import { ConfigurationError, getDatabase, type Database } from './src/server/db/client.js';
import { AccessDeniedError } from './src/server/policy.js';
import { createProductRouter, type ProductRuntime } from './src/server/product-router.js';
import { trustedApplicationOrigins } from './src/server/origin.js';

const isProduction = process.env.NODE_ENV === 'production';
const isVercel = Boolean(process.env.VERCEL);
const port = parsePort(process.env.PORT);

let runtime: ProductRuntime | undefined;

function parsePort(rawPort: string | undefined) {
  const parsed = Number(rawPort ?? 3000);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= 65_535 ? parsed : 3000;
}

function safeErrorLabel(error: unknown) {
  if (error instanceof Error) return error.name;
  return 'UnknownError';
}

function getRuntime(): { database: Database; auth: Cre8tivAuth } {
  if (runtime) return runtime;
  const database = getDatabase();
  runtime = { database, auth: createAuth(database) };
  return runtime;
}

function requireSameOrigin(req: Request, res: Response, next: NextFunction) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();
  const origin = req.get('origin');
  if (!origin) return next();

  const allowedOrigins = trustedApplicationOrigins(isProduction ? undefined : `http://localhost:${port}`);
  if (allowedOrigins.length === 0) return res.status(503).json({ error: 'Server origin is not configured.' });

  try {
    const requestOrigin = new URL(origin).origin;
    if (!allowedOrigins.some((allowedOrigin) => requestOrigin === new URL(allowedOrigin).origin)) {
      return res.status(403).json({ error: 'Cross-origin request denied.' });
    }
  } catch {
    return res.status(403).json({ error: 'Invalid request origin.' });
  }
  return next();
}

const apiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 120,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

export function createCoreApp() {
  const app = express();
  app.disable('x-powered-by');
  if (isProduction) app.set('trust proxy', 1);

  app.use(helmet({
    contentSecurityPolicy: isProduction ? {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        upgradeInsecureRequests: [],
      },
    } : false,
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    hsts: isProduction,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  }));

  // Better Auth must receive the raw body before express.json().
  app.all('/api/auth/*', async (req, res) => {
    try {
      return await toNodeHandler(getRuntime().auth)(req, res);
    } catch (error) {
      console.warn('Authentication request unavailable.', { errorType: safeErrorLabel(error) });
      return res.status(503).json({ error: 'Authentication is temporarily unavailable.' });
    }
  });

  app.use(express.json({ limit: '64kb', strict: true }));
  app.use('/api', apiLimiter, requireSameOrigin);
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', databaseConfigured: Boolean(process.env.DATABASE_URL) });
  });
  app.use('/api', createProductRouter(getRuntime));
  app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found.' }));

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof AccessDeniedError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    if (error instanceof ConfigurationError) {
      return res.status(503).json({ error: 'The database is temporarily unavailable.' });
    }
    console.error('Unhandled request error.', { errorType: safeErrorLabel(error) });
    return res.status(500).json({ error: 'Internal server error.' });
  });

  return app;
}

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
