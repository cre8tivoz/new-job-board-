import 'dotenv/config';

import { and, eq } from 'drizzle-orm';
import { createAuth, type PublicRole } from '../../src/server/auth.js';
import { getDatabase } from '../../src/server/db/client.js';
import { applications, jobs, passports, user } from '../../src/server/db/schema.js';

const database = getDatabase();
const auth = createAuth(database);

const demoPassword = process.env.DEMO_PASSWORD?.trim();
if (process.env.ALLOW_DEMO_SEED !== '1') throw new Error('Demo seeding requires ALLOW_DEMO_SEED=1.');
if (!demoPassword || demoPassword.length < 12) throw new Error('DEMO_PASSWORD must contain at least 12 characters.');

const demoUsers = [
  { email: process.env.DEMO_CANDIDATE_EMAIL || 'candidate.demo@cre8tiv.test', name: 'Maya Thompson', accountType: 'candidate' as PublicRole },
  { email: process.env.DEMO_EMPLOYER_EMAIL || 'employer.demo@cre8tiv.test', name: 'Noah Williams', accountType: 'employer' as PublicRole },
  { email: process.env.DEMO_ADMIN_EMAIL || 'admin.demo@cre8tiv.test', name: 'Priya Nair', accountType: 'candidate' as PublicRole },
];

async function ensureUser(details: typeof demoUsers[number]) {
  const [existing] = await database.select().from(user).where(eq(user.email, details.email)).limit(1);
  if (existing) return existing;
  const result = await auth.api.signUpEmail({
    body: {
      email: details.email,
      password: demoPassword!,
      name: details.name,
      accountType: details.accountType,
    },
  });
  const [created] = await database.select().from(user).where(eq(user.id, result.user.id)).limit(1);
  if (!created) throw new Error('Demo user creation failed.');
  return created;
}

const candidate = await ensureUser(demoUsers[0]);
const employer = await ensureUser(demoUsers[1]);
const adminUser = await ensureUser(demoUsers[2]);
await database.update(user).set({ role: 'admin', updatedAt: new Date() }).where(eq(user.id, adminUser.id));

const [candidatePassport] = await database.insert(passports).values({
  candidateId: candidate.id,
  slug: 'maya-thompson',
  headline: 'Brand designer shaping useful, joyful public experiences',
  location: 'Naarm / Melbourne, VIC',
  biography: 'Maya is a multidisciplinary designer with six years of experience across identity, digital products and cultural campaigns. She works best with thoughtful teams and clear social purpose.',
  skills: ['Brand identity', 'Art direction', 'Figma', 'Design systems', 'Accessibility'],
  portfolioLinks: [
    { label: 'Selected work', url: 'https://example.com/maya-thompson' },
    { label: 'Are.na references', url: 'https://www.are.na/' },
  ],
  availability: 'Available for permanent Melbourne or hybrid roles from August 2026',
}).onConflictDoUpdate({
  target: passports.candidateId,
  set: { updatedAt: new Date() },
}).returning();

async function ensureJob(title: string, values: Omit<typeof jobs.$inferInsert, 'title'>) {
  const [existing] = await database.select().from(jobs)
    .where(and(eq(jobs.employerId, employer.id), eq(jobs.title, title))).limit(1);
  if (existing) return existing;
  const [created] = await database.insert(jobs).values({ title, ...values }).returning();
  return created;
}

const publishedJobs = await Promise.all([
  ensureJob('Senior Brand Designer', {
    employerId: employer.id,
    company: 'Tidepool Studio',
    location: 'Collingwood, VIC',
    workArrangement: 'hybrid',
    employmentType: 'full_time',
    salaryMin: 105000,
    salaryMax: 125000,
    salaryText: 'Plus superannuation',
    description: 'Lead identity and digital brand programs for Australian cultural, hospitality and purpose-led organisations. You will work directly with the creative director, mentor two designers and present clear design rationale to clients. The studio values craft, accessibility and calm collaboration over performative overtime.',
    applicationDetails: 'Apply through Cre8tiv with your Passport. Include a short note about one identity system you are proud of and the decisions behind it.',
    status: 'published',
    submittedAt: new Date('2026-07-18T00:00:00Z'),
    reviewedAt: new Date('2026-07-19T00:00:00Z'),
    publishedAt: new Date('2026-07-20T00:00:00Z'),
    expiresAt: new Date('2026-08-19T00:00:00Z'),
  }),
  ensureJob('Frontend Engineer — Arts Platforms', {
    employerId: employer.id,
    company: 'Laneway Digital',
    location: 'Sydney, NSW',
    workArrangement: 'remote',
    employmentType: 'full_time',
    salaryMin: 120000,
    salaryMax: 145000,
    salaryText: 'Plus superannuation; Australia-based remote',
    description: 'Build accessible publishing and ticketing experiences for galleries, festivals and independent arts organisations. The role focuses on React, TypeScript, performance and close collaboration with designers. The team ships deliberately, documents decisions and does not use automated candidate ranking.',
    applicationDetails: 'Apply with your Cre8tiv Passport and tell us about a frontend trade-off you handled well.',
    status: 'published',
    submittedAt: new Date('2026-07-16T00:00:00Z'),
    reviewedAt: new Date('2026-07-17T00:00:00Z'),
    publishedAt: new Date('2026-07-18T00:00:00Z'),
    expiresAt: new Date('2026-08-17T00:00:00Z'),
  }),
]);

const [existingPending] = await database.select().from(jobs)
  .where(eq(jobs.title, 'Motion Designer')).limit(1);
if (!existingPending) {
  await database.insert(jobs).values({
    employerId: employer.id,
    title: 'Motion Designer',
    company: 'Tidepool Studio',
    location: 'Collingwood, VIC',
    workArrangement: 'hybrid',
    employmentType: 'contract',
    salaryText: '$650–$800 per day plus GST',
    description: 'Create expressive motion systems for a six-month museum exhibition campaign. The work spans title sequences, social assets and in-gallery screens, with a strong focus on typography and accessible pacing. You will collaborate with a compact design and production team in Melbourne.',
    applicationDetails: 'This listing is awaiting human review. Payment is not collected until it is approved.',
    status: 'pending_review',
    submittedAt: new Date(),
  });
}

const [publishedJob] = publishedJobs;
if (publishedJob && candidatePassport) {
  await database.insert(applications).values({
    jobId: publishedJob.id,
    candidateId: candidate.id,
    passportId: candidatePassport.id,
    note: 'I would love to bring my identity and design-systems experience to this role. My Passport includes a recent arts-sector rebrand.',
  }).onConflictDoNothing();
}

console.log('Demo seed completed with candidate, employer, administrator, Passport, jobs and application records.');
