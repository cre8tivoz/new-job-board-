# Cre8tiv

Cre8tiv is a human-reviewed Australian creative and technology jobs portal.
Candidates create one free permanent Passport, local employers submit a flat
AUD $30 exclusive, and registered Passport holders apply directly. Jobs appear
chronologically: there is no paid promotion, algorithmic feed, or automated
applicant ranking.

## Build Week judged workflow

The implemented vertical slice is:

1. A visitor browses published Australian creative and technology jobs.
2. A candidate registers and creates a public Cre8tiv Passport.
3. An employer registers and submits a $30 exclusive listing.
4. The listing enters `pending_review` before payment or publication.
5. An administrator approves or rejects it; approval and publication are
   separate accountable actions.
6. A registered candidate with a Passport applies once.
7. The owning employer reviews the attributable applicant and public Passport.

The payment hand-off is intentionally simulated and labelled. Production
Stripe charging, job aggregation, recommendations, and applicant scoring are
outside this submission.

## OpenAI Build Week evidence

Build Week judging should consider work beginning with commit `a25f8cf`.
Earlier commits are the preserved Google AI Studio prototype baseline. The
original-to-sanitised history mapping is in
[`docs/BUILD_WEEK_PROVENANCE.md`](docs/BUILD_WEEK_PROVENANCE.md), and the judged
product log is in [`BUILD_WEEK_CHANGELOG.md`](BUILD_WEEK_CHANGELOG.md).

### What existed before Build Week

The AI Studio prototype supplied a React/Vite visual concept, themed landing
and job screens, mock jobs, a candidate profile editor, a browser-local Kanban
board, presentation analytics, and Firebase/Google scaffolding. Those screens
and prototype flows are not claimed as GPT-5.6 Build Week output.

### What the AI Studio prototype got wrong

The prototype committed a credential-bearing Firebase configuration, sent a
privileged AI key toward browser code, mixed public and private candidate data,
relied on UI/local storage for trust decisions, exposed insufficiently
protected provider routes, and had material dependency advisories. It did not
provide production authentication, ownership checks, a durable listing
lifecycle, or attributable applications.

### What Codex changed

Codex first completed the security rescue and history sanitisation. It then
replaced the Firebase-shaped prototype with:

- Neon Postgres through `@neondatabase/serverless` and Drizzle ORM;
- versioned relational migrations and database constraints;
- Better Auth email/password accounts and database-backed secure sessions;
- server-owned role checks and resource ownership checks;
- candidate Passport, employer listing, administrator review, publication,
  application, and applicant-review routes;
- chronological published-job discovery with no ranking field or promotion;
- realistic Australian seed records;
- safe loading, error and empty states across the core responsive interface;
- focused adversarial integration tests; and
- Vercel-compatible lazy server/database initialisation.

### Where GPT-5.6 was specifically used

GPT-5.6 operating through Codex materially contributed to repository and Git
history auditing, trust-boundary design, schema and lifecycle modelling,
Better Auth/Express integration, Neon/Drizzle implementation, permission and
ownership analysis, server-side Zod validation, database constraints,
adversarial test design, Build Week evidence, dependency remediation, and
repeatable verification. GPT-5.6 did not create the pre-Build Week prototype
screens or mock flows.

### Key architectural decisions

- **One server trust boundary:** the browser never supplies a trusted user ID,
  role, owner ID, price, listing type, or lifecycle status.
- **Maintained authentication:** Better Auth owns password hashing, session
  tokens, cookies, expiry, and auth rate limiting. Administrator role cannot be
  selected during public registration.
- **Serverless Postgres:** the Neon HTTP driver is initialised lazily and only
  in server modules. `DATABASE_URL` is never exposed through Vite.
- **Relational enforcement:** unique Passport owners/slugs, one candidate
  application per job, fixed exclusive price, role ownership, published-job
  applications, and lifecycle transitions have database constraints or
  triggers in addition to route checks.
- **Human publication:** `pending_review → approved → published` remains two
  administrator actions; rejection is available only from review.
- **Transparent discovery:** public jobs are ordered by publication time and
  title. There is no promotion or scoring column.
- **No Google runtime:** Firebase, Firestore, Gemini, Google identity, Google
  Fonts, related configuration, and provider dead code were removed.

Detailed decisions are recorded in
[`docs/ARCHITECTURE_DECISIONS.md`](docs/ARCHITECTURE_DECISIONS.md).

### Dated Build Week commits

Times are Australia/Melbourne. Hashes are the sanitised post-rewrite hashes.

| Date | Commit | Build Week work |
| --- | --- | --- |
| 21 July 2026, 17:35 | `a25f8cf` | `security: remove exposed client credentials` |
| 21 July 2026, 17:35 | `1336150` | `security: move privileged API access server-side` |
| 21 July 2026, 17:35 | `0ccf74a` | `security: add environment and secret safeguards` |
| 21 July 2026, 17:35 | `d2c9cf5` | `security: add automated scanning and verification` |
| 21 July 2026, 17:55 | `5387f4e` | `docs: preserve Build Week evidence and add Apache-2.0 license` |
| 21 July 2026, 18:32 | `ae0e1d3` | `feat: replace firebase prototype with secure judged workflow` |
| 21 July 2026, 18:33 | `540a466` | `test: verify permissions and core product workflow` |
| 21 July 2026, 18:46 | `866eef3` | `docs: record build week architecture and demonstration path` |
| 21 July 2026, 18:48 | `a01c97d` | `ci: update pinned security action runtimes` |
| 21 July 2026, 18:48 | `ff59782` | `docs: update build week commit ledger` |
| 21 July 2026, 19:00 | `0fa87c4` | `fix: trust vercel deployment origins` |
| 21 July 2026, 19:05 | `2f19637` | `fix: deploy Vite frontend and Express API on Vercel` |
| 21 July 2026, 19:11 | `f0a8f1a` | `fix: cleanly unmount role dashboards` |

The table records material security, product, test, documentation, and CI stages.
Use `git log --date=local` for the authoritative complete commit ledger.

## Production architecture

```text
React/Vite browser
    │ same-origin HTTPS + secure session cookie
    ▼
Express application on Vercel Functions
    ├── Better Auth session and server-owned role
    ├── Zod request validation and ownership policy
    └── Drizzle parameterised queries
            ▼
    Vercel Marketplace Neon Postgres
```

Client code imports only the auth client and same-origin API helper. Database,
auth configuration, secrets, role decisions, ownership queries, price, and
lifecycle mutations remain in `src/server/`.

## Local setup from a fresh clone

Requirements: Node.js 20 or newer, npm, and a fresh Neon Postgres database.

```bash
git clone https://github.com/cre8tivoz/cre8tiv-job-board.git
cd cre8tiv-job-board
cp .env.example .env
npm ci
```

Complete the placeholders in `.env` locally. Use the Neon pooled connection
string for `DATABASE_URL`, create a unique Better Auth secret of at least 32
characters, and use the `.env.example` local application URLs for development.
Never prefix `DATABASE_URL` or `BETTER_AUTH_SECRET` with `VITE_`.

Apply migrations and load demonstration data:

```bash
npm run db:migrate
npm run db:seed
```

`db:seed` runs only when `ALLOW_DEMO_SEED=1` and requires a replaceable
`DEMO_PASSWORD` of at least 12 characters. Do not reuse production credentials.

Start the application:

```bash
npm run dev
```

Open `localhost:3000` in your browser. Demonstration account email addresses are listed
in `.env.example`; the password is deliberately not committed. Judge passwords
should be supplied through private Devpost testing instructions and rotated or
removed after judging.

## Database commands

```bash
npm run db:generate  # generate a migration after an intentional schema change
npm run db:migrate   # apply committed migrations to DATABASE_URL
npm run db:verify    # apply every migration to a fresh PostgreSQL-compatible DB
npm run db:seed      # idempotently create demonstration records
```

The seed includes a candidate, employer, administrator, public Passport, two
published Australian jobs, a pending listing, and one registered application.
All identities and organisations are fictional demonstration data.

## Tests and security verification

```bash
npm run check
npm run security:secrets:history
npm audit --audit-level=high
```

`npm run check` performs ESLint, TypeScript checking, fresh migration
verification, ten integration tests, a redacting working-tree secret scan, and
production client/server builds. The tests verify unauthenticated and
Passport-less application denial, role restrictions, administrator decisions,
cross-employer and cross-candidate isolation, duplicate applications, unique
slugs, lifecycle enforcement, and safe database errors.

## Vercel and Neon deployment

Production is live at [cre8tivjobs.vercel.app](https://cre8tivjobs.vercel.app)
under the Vercel project slug `cre8tivjobs`. The project uses a Vercel
Marketplace Neon database in Sydney. Committed migrations have been applied
and the dedicated fictional demonstration seed has been loaded.

Vercel serves the Vite build from `dist/`. Requests under `/api/*` are routed
to the single Express function at `api/index.ts`, also deployed in Sydney.
`DATABASE_URL`, Neon connection values, `BETTER_AUTH_SECRET`, and the replaceable
demonstration password are encrypted server-side environment variables. Preview
and Production use separate auth signing secrets; no privileged variable uses a
browser-public prefix.

The production browser verification covered public chronological jobs,
candidate sign-in, the persisted Passport, attributable application history,
employer-owned listings and applicants, the administrator review queue, and
clean role-dashboard sign-out. No production review decision or new application
was created during verification, so the seeded demonstration remains repeatable.

## Strongest 90-second demonstration

A silent 20-second production capture of employer registration and a listing
entering manual review is available at
[`docs/media/cre8tiv-employer-profile-and-listing-20s.mp4`](docs/media/cre8tiv-employer-profile-and-listing-20s.mp4).

1. Browse the two chronologically ordered Australian jobs while signed out.
2. Sign in as the candidate, open the permanent Passport, and show the public
   slug.
3. Sign in as the employer and submit a complete $30 exclusive; show
   `pending_review` and the simulated post-approval payment note.
4. Sign in as the administrator, approve the listing, then publish it as a
   separate action.
5. Sign back in as the candidate and apply with the Passport; repeat to show
   duplicate prevention.
6. Sign in as the employer, open the published listing's applicants, and view
   the registered candidate's Passport.

## Current limitations

- No production payment is collected; the hand-off is explicitly simulated.
- Email verification, password reset delivery, and transactional email require
  a future provider and are not claimed complete.
- Seed credentials are environment-supplied and must remain demonstration-only.
- The shared Build Week deployment is demonstration infrastructure, not a
  general-availability service; rotate or remove judge access after judging.

## Licence

Licensed under the [Apache License 2.0](LICENSE). Product names and trademarks
are not granted by the software licence.
