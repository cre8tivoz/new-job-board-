# Architecture decisions

## ADR-001: Neon Postgres with Drizzle

**Date:** 21 July 2026  
**Status:** accepted

Use Vercel Marketplace Neon through `@neondatabase/serverless` and Drizzle ORM.
The Neon HTTP driver is serverless-safe for this request/response workload,
Drizzle keeps queries parameterised and typed, and committed migrations make a
fresh database reproducible. The sunset `@vercel/postgres` package is not used.

## ADR-002: Better Auth in the existing Express/Vite stack

**Date:** 21 July 2026  
**Status:** accepted

Use Better Auth email/password credentials rather than adding a paid identity
provider or inventing password/session cryptography. Better Auth owns hashing,
tokens, cookies, expiry, and auth rate limiting. Candidate/employer account type
is validated at registration; role used for authorisation is persisted and read
server-side. Administrator role is never a public registration choice.

Email verification and password-reset delivery are deferred until a delivery
provider is deliberately selected. They are documented as limitations, not
simulated as complete functionality.

## ADR-003: Route and database policy both enforce boundaries

**Date:** 21 July 2026  
**Status:** accepted

Every mutation authenticates a server session, checks role and ownership, and
validates a strict Zod schema. Database uniqueness, checks, foreign keys and
triggers independently enforce critical invariants: one Passport per candidate,
unique slug, one application per candidate/job, fixed price/listing type,
candidate/employer ownership, published-job applications and allowed lifecycle
transitions.

## ADR-004: Human review and neutral ordering

**Date:** 21 July 2026  
**Status:** accepted

Listing submission creates `pending_review`. An administrator must approve and
then publish in separate actions; only review can reject. Public discovery sorts
by publication time and title. The model contains no promotion bid, relevance
score, recommendation score, or automated applicant rank.

## ADR-005: Same-origin Vercel deployment

**Date:** 21 July 2026  
**Status:** accepted

Keep React/Vite and Express as one same-origin Vercel deployment. Express is
exported through `api/index.ts` as a Vercel Function in Sydney, Vite emits CDN
assets to `dist/`, and `/api/*` is routed to Express before the SPA fallback.
Auth uses secure same-origin cookies and dynamically trusts the canonical Vercel
production or preview origin. Database and auth initialisation remain lazy so
missing environment variables produce safe runtime errors rather than crashing
the build.
