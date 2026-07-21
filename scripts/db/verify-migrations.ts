import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PGlite } from '@electric-sql/pglite';

const database = new PGlite();
const migrations = (await readdir(join(process.cwd(), 'drizzle')))
  .filter((file) => file.endsWith('.sql'))
  .sort();

for (const migration of migrations) {
  const contents = await readFile(join(process.cwd(), 'drizzle', migration), 'utf8');
  const statements = contents.split('--> statement-breakpoint').map((value) => value.trim()).filter(Boolean);
  for (const statement of statements) await database.exec(statement);
}

const tables = await database.query<{ table_name: string }>(
  `select table_name from information_schema.tables where table_schema = 'public' order by table_name`,
);
const expected = ['accounts', 'applications', 'jobs', 'passports', 'sessions', 'users', 'verifications'];
const actual = tables.rows.map((row) => row.table_name).filter((name) => expected.includes(name));
if (actual.join(',') !== expected.join(',')) throw new Error('Migration verification did not create the expected tables.');

await database.close();
console.log('Database migrations apply cleanly to a fresh PostgreSQL-compatible database.');
