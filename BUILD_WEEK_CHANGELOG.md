# Build Week changelog

This file records judged work added after the pre-existing Google AI Studio
prototype. Security remediation commits precede product implementation by
design.

## Judging-criteria implementation checklist

### 1. Technological implementation

- [x] Maintained email/password authentication with secure database sessions.
- [x] Candidate, employer, and administrator roles enforced server-side.
- [x] Server-side ownership checks for jobs, applicants, Passports, and applications.
- [x] Neon serverless driver and Drizzle parameterised queries.
- [x] Versioned schema migrations with database constraints and triggers.
- [x] Server-side Zod validation and safe errors.
- [x] Repeatable Australian demonstration seed.
- [x] Focused adversarial integration tests and secret/dependency checks.
- [ ] Provision and verify the production Vercel Marketplace Neon environment.

### 2. Design

- [x] Coherent editorial/brutalist visual direction retained from the prototype.
- [x] Responsive job discovery, Passport, employer, administrator, and application flows.
- [x] Accessible labels, focus states, status labels, loading, empty, success, and error states.
- [x] Public candidate Passport designed as the strongest identity surface.

### 3. Potential impact

- [x] Candidate Passport and applications remain free.
- [x] Exclusive listing price is fixed at AUD $30 in route and database policy.
- [x] Manual review occurs before simulated payment and publication.
- [x] Applications require a registered candidate and completed Passport.
- [x] Chronological discovery has no paid or algorithmic ranking.

### 4. Quality of the idea

- [x] Permanent Passport replaces repeated résumé upload in the judged flow.
- [x] Human-reviewed Australian creative/technology listings are demonstrable.
- [x] Employers receive attributable registered applicants.
- [x] Human administrators remain responsible for approval and publication.

## 21 July 2026

### Security rescue

- Removed exposed client credentials and privileged browser access.
- Added environment safeguards, redacting scanners, dependency checks and CodeQL.
- Rewrote reachable Git history only after revocation and explicit approval.
- Recorded the sanitised prototype baseline and Build Week boundary.

### Judged product implementation

- Removed Firebase, Firestore, Gemini, Google identity, Google Fonts, third-party
  job API code, public provider environment variables, and local-storage trust.
- Added Neon/Drizzle schema, migrations, constraints, triggers, and lazy client.
- Added Better Auth credentials, secure sessions, public account types, and a
  server-owned administrator role.
- Added persistent candidate Passports, employer exclusives, manual review,
  publication, candidate applications, and employer applicant review.
- Added realistic fictional Australian demonstration records and idempotent seed.
- Rebuilt the core interface around the complete vertical slice.
- Added ten integration tests covering the required permission and lifecycle cases.
- Verified lint, types, migrations, tests, secret scans, dependency audit, local
  production build, and Vercel-mode build.
- Verified the responsive public shell in a real browser; with no database
  configured it rendered the intended safe setup error without exposing details.

## Codex and GPT-5.6 contribution

Codex using GPT-5.6 accelerated the repository audit, architecture selection,
schema and trust-boundary design, implementation, adversarial tests, dependency
repair, verification, and evidence trail. The pre-Build Week prototype design
and screens remain clearly separated in Git history and README provenance.
