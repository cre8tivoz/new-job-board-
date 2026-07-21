<div align="center">

# Cre8tiv

### A fairer home for Australian creative and technology jobs

Free permanent candidate Passports. Human-reviewed $30 job listings. No paid
promotion, no algorithmic ranking and no mucking about.

[![Open Cre8tiv](https://img.shields.io/badge/OPEN_THE_LIVE_APP-Cre8tiv-e8ff36?style=for-the-badge&logo=vercel&logoColor=000000)](https://cre8tivjobs.vercel.app)

[![Application security](https://github.com/cre8tivoz/cre8tiv-job-board/actions/workflows/security.yml/badge.svg)](https://github.com/cre8tivoz/cre8tiv-job-board/actions/workflows/security.yml)
[![React 19](https://img.shields.io/badge/React_19-20232a?style=flat-square&logo=react&logoColor=61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646cff?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)
[![Express](https://img.shields.io/badge/Express-111111?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Neon Postgres](https://img.shields.io/badge/Neon_Postgres-00e599?style=flat-square&logo=postgresql&logoColor=111111)](https://neon.tech/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-111111?style=flat-square)](https://www.better-auth.com/)
[![Apache 2.0](https://img.shields.io/badge/licence-Apache--2.0-d22128?style=flat-square&logo=apache)](LICENSE)

**[Try the live app](https://cre8tivjobs.vercel.app)** ·
**[Watch the 20-second employer demo](docs/media/cre8tiv-employer-profile-and-listing-20s.mp4)** ·
**[See the Build Week changelog](BUILD_WEEK_CHANGELOG.md)**

</div>

## G'day — this is Cre8tiv

Cre8tiv is the Australian creative and technology jobs portal I wanted to see:
straightforward for candidates, affordable for local employers and transparent
about how work is discovered.

Candidates create one free, permanent public Passport and use it to apply.
Employers submit a flat AUD $30 exclusive listing for manual review. Published
jobs appear in chronological order — nobody can pay to jump the queue and no
algorithm decides what a candidate should see.

This Build Week version is a secure, working vertical slice. It deliberately
focuses on the full path from account creation to a real, attributable job
application before expanding the feature set.

## At a glance

| Who | What they can do today |
| --- | --- |
| Visitor | Browse human-approved Australian jobs in chronological order and view public candidate Passports. |
| Candidate | Register, create a permanent Passport, apply to a published job once and review their application history. |
| Employer | Register, create an employer profile, submit a $30 exclusive for review and view applicants for their own published jobs. |
| Administrator | Review, approve or reject listings, then publish approved work as a separate accountable action. |

The listing payment hand-off is currently a clearly labelled simulation. No
card is charged in this demonstration.

## The complete Build Week flow

1. A visitor browses published creative and technology jobs.
2. A candidate registers and creates their public Cre8tiv Passport.
3. An employer registers, creates a profile and submits a $30 exclusive.
4. The listing enters `pending_review`; it cannot quietly publish itself.
5. An administrator approves or rejects it.
6. Approval and publication remain separate, auditable actions.
7. A registered candidate with a Passport applies once.
8. The owning employer reviews the attributable applicant and their Passport.

Every identity, organisation and job in the included demonstration data is
fictional.

## Why it fits the judging criteria

### Technological implementation

Cre8tiv is more than a presentation layer. The React/Vite browser talks to an
Express API running as a Vercel Function. Better Auth manages password hashing
and secure database-backed sessions, while Neon Postgres and Drizzle provide a
durable relational model. Zod validates server input, and role, ownership,
price and workflow decisions are enforced at the API and database boundaries.

The implementation includes focused adversarial tests, secret and dependency
scanning, protected server-only environment variables, pinned GitHub Actions
and a production deployment in Vercel's Sydney region.

### Design

The product uses plain language and clear status states so candidates and small
employers can understand what happens next. The core screens are responsive,
keyboard-usable and built with semantic controls, visible focus treatments,
labelled forms and useful loading, empty and error states.

The current interface is the secure Build Week foundation. The next design
stage will restore the prototype's personality as a mobile-first, accessible
three-theme experience: **Neo**, **Cottage Call** and deliberately sensible
**Lame Mode**.

### Potential impact

Creative candidates get a reusable public identity without a subscription.
Small Australian employers get a simple, low-cost listing rather than an
auction for visibility. Human review, chronological discovery and the absence
of applicant scoring make the rules easy to understand for everyone.

### Quality of the idea

The model is intentionally opinionated: one candidate Passport, one honest
listing price and one visible route into every job. Cre8tiv does not sell
attention back to either side of the market. That makes the experience a little
less like ad-tech and a little more like a useful local jobs board.

## Try it live

The production demonstration is at
**[https://cre8tivjobs.vercel.app](https://cre8tivjobs.vercel.app)**.

Judge account details are supplied privately with the competition entry. No
passwords or privileged credentials are stored in this repository. You can
still explore the public job board and Passport pages without signing in.

For the quickest tour, watch the
**[20-second employer profile and listing demo](docs/media/cre8tiv-employer-profile-and-listing-20s.mp4)**.

## Run Cre8tiv locally

You'll need:

- Node.js 20 or newer;
- npm; and
- an empty [Neon Postgres](https://neon.tech/) database.

### Option A: clone with Git

```bash
git clone https://github.com/cre8tivoz/cre8tiv-job-board.git
cd cre8tiv-job-board
```

### Option B: download and extract a ZIP

1. Open the repository on GitHub.
2. Select **Code**, then **Download ZIP**.
3. Extract the downloaded ZIP to a folder on your computer.
4. Open a terminal in the extracted `cre8tiv-job-board` folder.

### Install and configure

From the project folder, run:

```bash
cp .env.example .env
npm ci
```

Open `.env` and replace the placeholders. Use your Neon pooled connection
string for `DATABASE_URL`, and generate a unique `BETTER_AUTH_SECRET` containing
at least 32 characters. Keep the local application URLs supplied by
`.env.example`.

Never prefix `DATABASE_URL`, `BETTER_AUTH_SECRET` or any other privileged value
with `VITE_`, `NEXT_PUBLIC_` or an equivalent public prefix.

Initialise the database and add the fictional demo records:

```bash
npm run db:migrate
npm run db:seed
```

The seed is opt-in: it only runs while `ALLOW_DEMO_SEED=1` and requires a
replaceable `DEMO_PASSWORD` of at least 12 characters. Please don't reuse a real
password.

Start the app:

```bash
npm run dev
```

Then visit **[http://localhost:3000](http://localhost:3000)**. Demo email
addresses are documented in `.env.example`; their password is deliberately not
committed.

## How it works

```text
React + Vite browser
        │
        │ same-origin HTTPS and secure session cookie
        ▼
Express API on Vercel Functions
        ├── Better Auth identity and server-owned role
        ├── Zod validation and ownership policy
        └── Drizzle parameterised queries
                    │
                    ▼
              Neon Postgres
```

Client code imports only the authentication client and a same-origin API
helper. Database access, secrets, trusted roles, resource ownership, price and
lifecycle mutations remain in `src/server/`.

Key decisions and their reasoning are recorded in
[`docs/ARCHITECTURE_DECISIONS.md`](docs/ARCHITECTURE_DECISIONS.md).

## Test and verify

Run the same broad verification used during Build Week:

```bash
npm run check
npm run security:secrets:history
npm audit --audit-level=high
```

`npm run check` runs linting, TypeScript checks, fresh migration verification,
integration tests, a redacting working-tree secret scan and production
client/server builds. The tests cover unauthenticated access, role boundaries,
cross-account isolation, duplicate applications, unique Passport slugs and
listing lifecycle enforcement.

Useful database commands:

```bash
npm run db:generate  # generate a migration after an intentional schema change
npm run db:migrate   # apply committed migrations
npm run db:verify    # test all migrations against a fresh compatible database
npm run db:seed      # load the opt-in fictional demonstration data
```

## Security and Build Week evidence

Security remediation came before new product work. The exposed credential from
the original prototype was revoked separately, all privileged access moved
server-side and the repository history was sanitised without retaining the
credential value in documentation.

- [`SECURITY_REMEDIATION.md`](SECURITY_REMEDIATION.md) explains the findings,
  fixes and verification without reproducing sensitive material.
- [`docs/BUILD_WEEK_PROVENANCE.md`](docs/BUILD_WEEK_PROVENANCE.md) preserves the
  boundary between the original prototype and judged work.
- [`BUILD_WEEK_CHANGELOG.md`](BUILD_WEEK_CHANGELOG.md) provides the dated,
  commit-by-commit Build Week ledger.
- [Application Security on GitHub Actions](https://github.com/cre8tivoz/cre8tiv-job-board/actions/workflows/security.yml)
  runs secret scanning, dependency checks, tests and production builds.

Build Week judging should consider work from commit `a25f8cf` onwards. The
sanitised pre-Build Week baseline is commit `a98b1f3`.

### What existed before Build Week

The Google AI Studio prototype supplied the original visual concept, themed
landing and job screens, mock data, a profile editor and a browser-local
candidate Kanban board. It was useful product exploration, but it did not have
production authentication, durable data ownership or a secure end-to-end job
workflow.

### What the prototype got wrong

The prototype committed credential-bearing provider configuration, directed a
privileged AI value towards browser code, mixed public and private candidate
data, relied on interface and local-storage trust decisions, and carried
material dependency advisories. Firebase, Firestore, Gemini and the associated
Google runtime scaffolding have now been removed.

### What Codex and GPT-5.6 changed

GPT-5.6 through Codex was used for the repository and history audit,
trust-boundary design, relational schema and lifecycle modelling, Better
Auth/Express integration, Neon/Drizzle implementation, authorisation and
ownership analysis, server-side validation, adversarial test design,
dependency remediation and repeatable Build Week evidence.

It then helped turn the prototype into the secure judged workflow described in
this README. The pre-Build Week visual prototype and its mock flows are not
claimed as GPT-5.6 output.

## Current limits — clearly labelled

- The $30 payment hand-off is simulated; no production payment is collected.
- Email verification, password reset delivery and transactional email still
  require a future provider.
- Google and GitHub sign-in are not yet enabled.
- Jobs are curated demo records, not aggregated from external services.
- Candidates have attributable application history today; the richer visual
  Kanban experience is planned for the next product stage.
- This shared deployment is competition demonstration infrastructure, not yet
  a general-availability service.

## What comes next

With the security foundation verified, the next scoped design pass will focus
on:

- a persistent candidate application Kanban board;
- mobile-first layouts and an accessibility baseline across every flow;
- the **Neo**, **Cottage Call** and **Lame Mode** themes;
- a richer public Passport, FAQ and roadmap experience;
- realistic fictional jobs across Australian states and territories; and
- carefully configured Google and GitHub sign-in.

Those features are direction, not claims about the current submission. Product
scope stays grounded in free Passports, affordable reviewed exclusives and
transparent chronological discovery.

## A strong 90-second judging path

1. Browse the chronologically ordered jobs while signed out.
2. Sign in as the candidate and show the permanent public Passport.
3. Sign in as the employer and submit a complete $30 exclusive.
4. Show the listing waiting in `pending_review`.
5. Sign in as the administrator, approve it, then publish it separately.
6. Apply as the registered candidate and show duplicate prevention.
7. Return as the employer and view the attributable applicant and Passport.

## Licence

Cre8tiv is open source under the [Apache License 2.0](LICENSE). Product names
and trademarks are not granted by the software licence.

---

<div align="center">

Built in Australia with care, curiosity and GPT-5.6 through Codex.

</div>
