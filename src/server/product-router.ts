import { and, asc, desc, eq, inArray } from 'drizzle-orm';
import { Router, type NextFunction, type Request, type Response } from 'express';
import type { AuthSession, Cre8tivAuth } from './auth.js';
import { readSession } from './auth.js';
import type { Database } from './db/client.js';
import { applications, jobs, passports, user, type JobStatus, type UserRole } from './db/schema.js';
import { AccessDeniedError, assertJobTransition, requireOwner, requireRole } from './policy.js';
import {
  applicationInputSchema,
  applicationStatusInputSchema,
  jobInputSchema,
  passportInputSchema,
  reviewInputSchema,
} from './validation.js';

export type ProductRuntime = { database: Database; auth: Cre8tivAuth };
type RuntimeProvider = () => ProductRuntime;
type AuthenticatedRequest = Request & { authSession?: NonNullable<AuthSession> };

function asyncRoute(handler: (req: AuthenticatedRequest, res: Response) => Promise<unknown>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res)).catch(next);
  };
}

function parseRole(session: NonNullable<AuthSession>): UserRole {
  const role = session.user.role;
  if (role === 'candidate' || role === 'employer' || role === 'admin') return role;
  throw new AccessDeniedError('Account role is invalid.');
}

// Express middleware must call next. This wrapper keeps session failures safe.
function authenticated(runtime: RuntimeProvider) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const session = await readSession(runtime().auth, req);
      if (!session) return res.status(401).json({ error: 'Authentication required.' });
      req.authSession = session;
      return next();
    } catch {
      return res.status(503).json({ error: 'Authentication is temporarily unavailable.' });
    }
  };
}

function sessionFor(req: AuthenticatedRequest) {
  if (!req.authSession) throw new AccessDeniedError('Authentication required.', 401);
  return req.authSession;
}

function databaseCode(error: unknown) {
  if (typeof error === 'object' && error && 'code' in error && typeof error.code === 'string') return error.code;
  if (typeof error === 'object' && error && 'cause' in error) return databaseCode(error.cause);
  return undefined;
}

function reviewTarget(action: 'approve' | 'reject' | 'publish'): JobStatus {
  if (action === 'approve') return 'approved';
  if (action === 'reject') return 'rejected';
  return 'published';
}

export function createProductRouter(runtime: RuntimeProvider) {
  const router = Router();

  router.get('/jobs', asyncRoute(async (_req, res) => {
    const rows = await runtime().database.select().from(jobs)
      .where(eq(jobs.status, 'published'))
      .orderBy(desc(jobs.publishedAt), asc(jobs.title));
    return res.json({ jobs: rows });
  }));

  router.get('/jobs/:jobId', asyncRoute(async (req, res) => {
    const [job] = await runtime().database.select().from(jobs)
      .where(and(eq(jobs.id, req.params.jobId), eq(jobs.status, 'published'))).limit(1);
    if (!job) return res.status(404).json({ error: 'Job not found.' });
    return res.json({ job });
  }));

  router.get('/passports/:slug', asyncRoute(async (req, res) => {
    const [passport] = await runtime().database.select({
      id: passports.id,
      slug: passports.slug,
      headline: passports.headline,
      location: passports.location,
      biography: passports.biography,
      skills: passports.skills,
      portfolioLinks: passports.portfolioLinks,
      availability: passports.availability,
      displayName: user.name,
    }).from(passports).innerJoin(user, eq(passports.candidateId, user.id))
      .where(eq(passports.slug, req.params.slug)).limit(1);
    if (!passport) return res.status(404).json({ error: 'Passport not found.' });
    return res.json({ passport });
  }));

  router.use(authenticated(runtime));

  router.get('/me/passport', asyncRoute(async (req, res) => {
    const session = sessionFor(req);
    requireRole(parseRole(session), 'candidate');
    const [passport] = await runtime().database.select().from(passports)
      .where(eq(passports.candidateId, session.user.id)).limit(1);
    return res.json({ passport: passport || null });
  }));

  router.put('/me/passport', asyncRoute(async (req, res) => {
    const session = sessionFor(req);
    requireRole(parseRole(session), 'candidate');
    const input = passportInputSchema.safeParse(req.body);
    if (!input.success) return res.status(400).json({ error: 'Passport details are invalid.', issues: input.error.flatten().fieldErrors });

    try {
      const [passport] = await runtime().database.insert(passports).values({
        candidateId: session.user.id,
        ...input.data,
      }).onConflictDoUpdate({
        target: passports.candidateId,
        set: { ...input.data, updatedAt: new Date() },
      }).returning();
      return res.json({ passport });
    } catch (error) {
      if (databaseCode(error) === '23505') return res.status(409).json({ error: 'That Passport URL is already taken.' });
      throw error;
    }
  }));

  router.post('/jobs', asyncRoute(async (req, res) => {
    const session = sessionFor(req);
    requireRole(parseRole(session), 'employer');
    const input = jobInputSchema.safeParse(req.body);
    if (!input.success) return res.status(400).json({ error: 'Listing details are invalid.', issues: input.error.flatten().fieldErrors });

    const [job] = await runtime().database.insert(jobs).values({
      employerId: session.user.id,
      ...input.data,
      listingType: 'exclusive',
      priceCents: 3000,
      status: 'pending_review',
      submittedAt: new Date(),
    }).returning();
    return res.status(201).json({ job, payment: { requiredAfterApproval: true, amountCents: 3000, simulated: true } });
  }));

  router.get('/employer/jobs', asyncRoute(async (req, res) => {
    const session = sessionFor(req);
    requireRole(parseRole(session), 'employer');
    const ownedJobs = await runtime().database.select().from(jobs)
      .where(eq(jobs.employerId, session.user.id)).orderBy(desc(jobs.createdAt));
    return res.json({ jobs: ownedJobs });
  }));

  router.get('/employer/jobs/:jobId/applications', asyncRoute(async (req, res) => {
    const session = sessionFor(req);
    requireRole(parseRole(session), 'employer');
    const [job] = await runtime().database.select().from(jobs).where(eq(jobs.id, req.params.jobId)).limit(1);
    if (!job) return res.status(404).json({ error: 'Job not found.' });
    requireOwner(job.employerId, session.user.id);

    const applicants = await runtime().database.select({
      id: applications.id,
      status: applications.status,
      note: applications.note,
      createdAt: applications.createdAt,
      passportSlug: passports.slug,
      headline: passports.headline,
      location: passports.location,
      candidateName: user.name,
    }).from(applications)
      .innerJoin(passports, eq(applications.passportId, passports.id))
      .innerJoin(user, eq(applications.candidateId, user.id))
      .where(eq(applications.jobId, job.id)).orderBy(asc(applications.createdAt));
    return res.json({ applications: applicants });
  }));

  router.patch('/employer/applications/:applicationId', asyncRoute(async (req, res) => {
    const session = sessionFor(req);
    requireRole(parseRole(session), 'employer');
    const input = applicationStatusInputSchema.safeParse(req.body);
    if (!input.success) return res.status(400).json({ error: 'Application status is invalid.' });

    const [record] = await runtime().database.select({ application: applications, job: jobs })
      .from(applications).innerJoin(jobs, eq(applications.jobId, jobs.id))
      .where(eq(applications.id, req.params.applicationId)).limit(1);
    if (!record) return res.status(404).json({ error: 'Application not found.' });
    requireOwner(record.job.employerId, session.user.id);
    const [application] = await runtime().database.update(applications)
      .set({ status: input.data.status, updatedAt: new Date() })
      .where(eq(applications.id, record.application.id)).returning();
    return res.json({ application });
  }));

  router.get('/admin/jobs', asyncRoute(async (req, res) => {
    const session = sessionFor(req);
    requireRole(parseRole(session), 'admin');
    const pendingJobs = await runtime().database.select().from(jobs)
      .where(inArray(jobs.status, ['pending_review', 'approved'])).orderBy(asc(jobs.submittedAt));
    return res.json({ jobs: pendingJobs });
  }));

  router.post('/admin/jobs/:jobId/review', asyncRoute(async (req, res) => {
    const session = sessionFor(req);
    requireRole(parseRole(session), 'admin');
    const input = reviewInputSchema.safeParse(req.body);
    if (!input.success) return res.status(400).json({ error: 'Review decision is invalid.' });

    const [job] = await runtime().database.select().from(jobs).where(eq(jobs.id, req.params.jobId)).limit(1);
    if (!job) return res.status(404).json({ error: 'Job not found.' });
    const target = reviewTarget(input.data.action);
    assertJobTransition(job.status, target);
    const now = new Date();
    const [updated] = await runtime().database.update(jobs).set({
      status: target,
      reviewNotes: input.data.notes || null,
      reviewedAt: input.data.action === 'publish' ? job.reviewedAt : now,
      publishedAt: input.data.action === 'publish' ? now : job.publishedAt,
      expiresAt: input.data.action === 'publish' ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) : job.expiresAt,
      updatedAt: now,
    }).where(eq(jobs.id, job.id)).returning();
    return res.json({ job: updated });
  }));

  router.post('/jobs/:jobId/applications', asyncRoute(async (req, res) => {
    const session = sessionFor(req);
    requireRole(parseRole(session), 'candidate');
    const input = applicationInputSchema.safeParse(req.body);
    if (!input.success) return res.status(400).json({ error: 'Application details are invalid.' });

    const [job] = await runtime().database.select().from(jobs)
      .where(and(eq(jobs.id, req.params.jobId), eq(jobs.status, 'published'))).limit(1);
    if (!job) return res.status(404).json({ error: 'Published job not found.' });
    const [passport] = await runtime().database.select().from(passports)
      .where(eq(passports.candidateId, session.user.id)).limit(1);
    if (!passport) return res.status(409).json({ error: 'Create your Passport before applying.' });

    try {
      const [application] = await runtime().database.insert(applications).values({
        jobId: job.id,
        candidateId: session.user.id,
        passportId: passport.id,
        note: input.data.note || null,
      }).returning();
      return res.status(201).json({ application });
    } catch (error) {
      if (databaseCode(error) === '23505') return res.status(409).json({ error: 'You have already applied for this job.' });
      throw error;
    }
  }));

  router.get('/me/applications', asyncRoute(async (req, res) => {
    const session = sessionFor(req);
    requireRole(parseRole(session), 'candidate');
    const ownApplications = await runtime().database.select({ application: applications, job: jobs })
      .from(applications).innerJoin(jobs, eq(applications.jobId, jobs.id))
      .where(eq(applications.candidateId, session.user.id)).orderBy(desc(applications.createdAt));
    return res.json({ applications: ownApplications });
  }));

  router.get('/me/applications/:applicationId', asyncRoute(async (req, res) => {
    const session = sessionFor(req);
    requireRole(parseRole(session), 'candidate');
    const [record] = await runtime().database.select({ application: applications, job: jobs })
      .from(applications).innerJoin(jobs, eq(applications.jobId, jobs.id))
      .where(eq(applications.id, req.params.applicationId)).limit(1);
    if (!record) return res.status(404).json({ error: 'Application not found.' });
    requireOwner(record.application.candidateId, session.user.id);
    return res.json(record);
  }));

  return router;
}
