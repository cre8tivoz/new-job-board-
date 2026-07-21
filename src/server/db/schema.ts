import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

export const userRole = pgEnum('user_role', ['candidate', 'employer', 'admin']);
export const workArrangement = pgEnum('work_arrangement', ['on_site', 'hybrid', 'remote']);
export const employmentType = pgEnum('employment_type', ['full_time', 'part_time', 'contract', 'casual']);
export const jobStatus = pgEnum('job_status', [
  'draft',
  'pending_review',
  'approved',
  'published',
  'rejected',
  'expired',
]);
export const applicationStatus = pgEnum('application_status', [
  'submitted',
  'reviewing',
  'shortlisted',
  'declined',
  'withdrawn',
]);

export type PortfolioLink = { label: string; url: string };

// Better Auth core tables use string IDs by design. Role is server-owned;
// accountType is accepted only at registration and can never create an admin.
export const user = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('display_name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  role: userRole('role').notNull().default('candidate'),
  accountType: text('account_type').notNull().default('candidate'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  check('users_account_type_check', sql`${table.accountType} in ('candidate', 'employer')`),
]);

export const session = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index('sessions_user_id_idx').on(table.userId)]);

export const account = pgTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
  scope: text('scope'),
  idToken: text('id_token'),
  password: text('password'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('accounts_provider_account_idx').on(table.providerId, table.accountId),
  uniqueIndex('accounts_user_provider_idx').on(table.userId, table.providerId),
]);

export const verification = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index('verifications_identifier_idx').on(table.identifier)]);

export const passports = pgTable('passports', {
  id: uuid('id').primaryKey().defaultRandom(),
  candidateId: text('candidate_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  slug: text('public_slug').notNull(),
  headline: text('headline').notNull(),
  location: text('location').notNull(),
  biography: text('biography').notNull(),
  skills: text('skills').array().notNull().default(sql`ARRAY[]::text[]`),
  portfolioLinks: jsonb('portfolio_links').$type<PortfolioLink[]>().notNull().default([]),
  availability: text('availability').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('passports_candidate_idx').on(table.candidateId),
  uniqueIndex('passports_slug_idx').on(table.slug),
  check('passports_slug_check', sql`${table.slug} ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'`),
]);

export const jobs = pgTable('jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  employerId: text('employer_id').notNull().references(() => user.id, { onDelete: 'restrict' }),
  title: text('title').notNull(),
  company: text('company').notNull(),
  location: text('location').notNull(),
  workArrangement: workArrangement('work_arrangement').notNull(),
  employmentType: employmentType('employment_type').notNull(),
  salaryMin: integer('salary_min'),
  salaryMax: integer('salary_max'),
  salaryText: text('salary_text'),
  description: text('description').notNull(),
  applicationDetails: text('application_details').notNull(),
  listingType: text('listing_type').notNull().default('exclusive'),
  priceCents: integer('price_cents').notNull().default(3000),
  status: jobStatus('status').notNull().default('draft'),
  reviewNotes: text('review_notes'),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  check('jobs_price_check', sql`${table.priceCents} = 3000`),
  check('jobs_listing_type_check', sql`${table.listingType} = 'exclusive'`),
  check('jobs_salary_check', sql`${table.salaryMin} is null or ${table.salaryMax} is null or ${table.salaryMin} <= ${table.salaryMax}`),
]);

export const applications = pgTable('applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  candidateId: text('candidate_id').notNull().references(() => user.id, { onDelete: 'restrict' }),
  passportId: uuid('passport_id').notNull().references(() => passports.id, { onDelete: 'restrict' }),
  note: text('application_note'),
  status: applicationStatus('status').notNull().default('submitted'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex('applications_candidate_job_idx').on(table.candidateId, table.jobId),
]);

export const schema = { user, session, account, verification, passports, jobs, applications };

export type UserRole = typeof userRole.enumValues[number];
export type JobStatus = typeof jobStatus.enumValues[number];
export type DatabaseUser = typeof user.$inferSelect;
export type DatabasePassport = typeof passports.$inferSelect;
export type DatabaseJob = typeof jobs.$inferSelect;
export type DatabaseApplication = typeof applications.$inferSelect;
