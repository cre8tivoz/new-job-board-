import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import express, { type NextFunction, type Request, type Response } from 'express';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { eq } from 'drizzle-orm';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { toNodeHandler } from 'better-auth/node';
import { createAuth } from '../src/server/auth.js';
import type { Database } from '../src/server/db/client.js';
import { jobs, schema, user } from '../src/server/db/schema.js';
import { AccessDeniedError, assertJobTransition } from '../src/server/policy.js';
import { createProductRouter } from '../src/server/product-router.js';

const pg = new PGlite();
const database = drizzle(pg, { schema });
const app = express();
let auth: ReturnType<typeof createAuth>;

type Account = { id: string; cookie: string };
let candidate: Account;
let candidateWithoutPassport: Account;
let employer: Account;
let otherEmployer: Account;
let administrator: Account;
let publishedJobId: string;
let pendingApproveId: string;
let pendingRejectId: string;
let applicationId: string;

async function applyMigrations() {
  for (const migration of ['0000_initial_neon_schema.sql', '0001_auth_index_correction.sql']) {
    const contents = await readFile(join(process.cwd(), 'drizzle', migration), 'utf8');
    for (const statement of contents.split('--> statement-breakpoint').map((value) => value.trim()).filter(Boolean)) {
      await pg.exec(statement);
    }
  }
}

async function register(email: string, name: string, accountType: 'candidate' | 'employer'): Promise<Account> {
  const response = await request(app).post('/api/auth/sign-up/email').send({
    email,
    password: 'replace_test_password_2026',
    name,
    accountType,
  });
  expect(response.status, JSON.stringify(response.body)).toBe(200);
  const cookie = response.headers['set-cookie']?.[0];
  expect(cookie).toBeTruthy();
  return { id: response.body.user.id, cookie };
}

function createPendingJob(ownerId: string, title: string) {
  return database.insert(jobs).values({
    employerId: ownerId,
    title,
    company: 'Test Studio',
    location: 'Melbourne, VIC',
    workArrangement: 'hybrid',
    employmentType: 'full_time',
    description: 'A sufficiently detailed role description used to verify the manual listing review lifecycle and its server-side permission boundary.',
    applicationDetails: 'Apply with a completed Cre8tiv Passport and a concise note about relevant work.',
    status: 'pending_review',
    submittedAt: new Date(),
  }).returning();
}

beforeAll(async () => {
  process.env.BETTER_AUTH_SECRET = 'replace_test_secret_value_longer_than_32_characters';
  process.env.BETTER_AUTH_URL = 'http://localhost:3000';
  process.env.APP_ORIGIN = 'http://localhost:3000';
  await applyMigrations();
  auth = createAuth(database as unknown as Database);
  app.all('/api/auth/*', toNodeHandler(auth));
  app.use(express.json());
  app.use('/api', createProductRouter(() => ({ database: database as unknown as Database, auth })));
  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof AccessDeniedError) return res.status(error.statusCode).json({ error: error.message });
    return res.status(500).json({ error: 'Internal server error.' });
  });

  candidate = await register('candidate-one@example.test', 'Candidate One', 'candidate');
  candidateWithoutPassport = await register('candidate-two@example.test', 'Candidate Two', 'candidate');
  employer = await register('employer-one@example.test', 'Employer One', 'employer');
  otherEmployer = await register('employer-two@example.test', 'Employer Two', 'employer');
  administrator = await register('administrator@example.test', 'Administrator', 'candidate');
  await database.update(user).set({ role: 'admin' }).where(eq(user.id, administrator.id));

  const passportResponse = await request(app).put('/api/me/passport').set('Cookie', candidate.cookie).send({
    slug: 'candidate-one',
    headline: 'Senior digital designer and accessibility advocate',
    location: 'Melbourne, VIC',
    biography: 'A detailed demonstration biography covering identity, product design and accessible digital experiences for Australian organisations.',
    skills: ['Figma', 'Design systems'],
    portfolioLinks: [{ label: 'Portfolio', url: 'https://example.com/candidate-one' }],
    availability: 'Available from August 2026',
  });
  expect(passportResponse.status).toBe(200);

  const [published] = await database.insert(jobs).values({
    employerId: employer.id,
    title: 'Published Designer Role',
    company: 'Test Studio',
    location: 'Melbourne, VIC',
    workArrangement: 'hybrid',
    employmentType: 'full_time',
    description: 'A published role with enough detail for a genuine registered candidate application and employer ownership verification.',
    applicationDetails: 'Apply using a completed Cre8tiv Passport and an optional concise note.',
    status: 'published',
    publishedAt: new Date(),
  }).returning();
  publishedJobId = published.id;
  [pendingApproveId] = (await createPendingJob(employer.id, 'Pending Approval Role')).map((job) => job.id);
  [pendingRejectId] = (await createPendingJob(employer.id, 'Pending Rejection Role')).map((job) => job.id);
});

afterAll(async () => { await pg.close(); });

describe('secure judged workflow', () => {
  it('rejects unauthenticated applications', async () => {
    const response = await request(app).post(`/api/jobs/${publishedJobId}/applications`).send({ note: null });
    expect(response.status).toBe(401);
  });

  it('rejects candidates without Passports', async () => {
    const response = await request(app).post(`/api/jobs/${publishedJobId}/applications`)
      .set('Cookie', candidateWithoutPassport.cookie).send({ note: null });
    expect(response.status).toBe(409);
    expect(response.body.error).toContain('Passport');
  });

  it('prevents candidates and employers from approving listings', async () => {
    const candidateResponse = await request(app).post(`/api/admin/jobs/${pendingApproveId}/review`)
      .set('Cookie', candidate.cookie).send({ action: 'approve', notes: null });
    const employerResponse = await request(app).post(`/api/admin/jobs/${pendingApproveId}/review`)
      .set('Cookie', employer.cookie).send({ action: 'approve', notes: null });
    expect(candidateResponse.status).toBe(403);
    expect(employerResponse.status).toBe(403);
  });

  it('allows an administrator to approve, publish and reject listings', async () => {
    const approved = await request(app).post(`/api/admin/jobs/${pendingApproveId}/review`)
      .set('Cookie', administrator.cookie).send({ action: 'approve', notes: 'Meets the listing standard.' });
    expect(approved.status).toBe(200);
    expect(approved.body.job.status).toBe('approved');
    const published = await request(app).post(`/api/admin/jobs/${pendingApproveId}/review`)
      .set('Cookie', administrator.cookie).send({ action: 'publish', notes: null });
    expect(published.status).toBe(200);
    expect(published.body.job.status).toBe('published');
    const rejected = await request(app).post(`/api/admin/jobs/${pendingRejectId}/review`)
      .set('Cookie', administrator.cookie).send({ action: 'reject', notes: 'Needs a specific salary range.' });
    expect(rejected.status).toBe(200);
    expect(rejected.body.job.status).toBe('rejected');
  });

  it('creates one attributable application and rejects a duplicate', async () => {
    const first = await request(app).post(`/api/jobs/${publishedJobId}/applications`)
      .set('Cookie', candidate.cookie).send({ note: 'A relevant application note.' });
    expect(first.status).toBe(201);
    applicationId = first.body.application.id;
    const duplicate = await request(app).post(`/api/jobs/${publishedJobId}/applications`)
      .set('Cookie', candidate.cookie).send({ note: null });
    expect(duplicate.status).toBe(409);
  });

  it('prevents another employer from seeing applicants', async () => {
    const response = await request(app).get(`/api/employer/jobs/${publishedJobId}/applications`)
      .set('Cookie', otherEmployer.cookie);
    expect(response.status).toBe(403);
  });

  it('prevents a candidate from reading another candidate application', async () => {
    const response = await request(app).get(`/api/me/applications/${applicationId}`)
      .set('Cookie', candidateWithoutPassport.cookie);
    expect(response.status).toBe(403);
  });

  it('enforces unique public Passport slugs', async () => {
    const response = await request(app).put('/api/me/passport').set('Cookie', candidateWithoutPassport.cookie).send({
      slug: 'candidate-one',
      headline: 'Another valid candidate headline',
      location: 'Sydney, NSW',
      biography: 'Another complete candidate biography that is long enough to pass server-side validation safely.',
      skills: ['TypeScript'],
      portfolioLinks: [],
      availability: 'Available now',
    });
    expect(response.status).toBe(409);
  });

  it('rejects invalid lifecycle transitions in application and database policy', async () => {
    expect(() => assertJobTransition('pending_review', 'published')).toThrow('not allowed');
    await expect(database.update(jobs).set({ status: 'expired' }).where(eq(jobs.id, pendingRejectId))).rejects.toThrow();
  });

  it('keeps database failures generic at the route boundary', async () => {
    const broken = express();
    broken.use(express.json());
    broken.use('/api', createProductRouter(() => { throw new Error('internal connection detail'); }));
    broken.use((_error: unknown, _req: Request, res: Response, _next: NextFunction) => res.status(500).json({ error: 'Internal server error.' }));
    const response = await request(broken).get('/api/jobs');
    expect(response.status).toBe(500);
    expect(JSON.stringify(response.body)).not.toContain('connection detail');
  });
});
