import { neon } from '@neondatabase/serverless';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { schema } from './schema.js';

export type Database = NeonHttpDatabase<typeof schema>;

let database: Database | undefined;

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

export function getDatabase(): Database {
  if (database) return database;

  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new ConfigurationError('Database is not configured.');
  }

  // The Neon HTTP driver is serverless-safe and does not open a persistent
  // socket. Initialisation stays lazy so Vercel builds can run without secrets.
  const client = neon(connectionString);
  database = drizzle({ client, schema });
  return database;
}
