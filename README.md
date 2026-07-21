# Cre8tiv Jobs

Cre8tiv is an Australian creative and technology jobs-portal prototype. The
product direction is a simple, transparent marketplace: permanent candidate
Passport pages remain free, exclusive job listings are manually reviewed and
cost a flat AUD $30, applications require a registered candidate, and paid
promotion or algorithmic ranking is not part of the model.

> **Current status:** security-remediated Build Week evidence snapshot. The
> original AI Studio project has been disconnected from this GitHub repository,
> its exposed credentials were revoked, and its Firebase/pay-as-you-go rollback
> is being handled in AI Studio. This repository should remain credential-free
> and local-only until a replacement database architecture is selected.

## OpenAI Build Week evidence

Build Week judging should consider only the work beginning with commit
`a25f8cf`. Earlier commits are preserved solely to show the pre-existing
prototype baseline. The full original-to-rewritten history mapping is recorded
in [`docs/BUILD_WEEK_PROVENANCE.md`](docs/BUILD_WEEK_PROVENANCE.md).

### What existed before Build Week

The Google AI Studio prototype already contained:

- a React 19 and Vite interface with three visual themes;
- landing, job-browser, job-detail, Passport, Kanban, studio, posting,
  transparency, FAQ, and login screens;
- mock Australian creative and technology jobs;
- a browser-local application board backed by `localStorage`;
- a candidate Passport editor with image and CV inputs;
- Firebase Authentication and Firestore scaffolding;
- an Express proxy for an external jobs API;
- browser-side Gemini “Magic Fill” extraction; and
- presentation-focused charts, animation, and legacy prototype artifacts.

These features were pre-existing prototype work. They are not claimed as
GPT-5.6 Build Week output and were not production-ready.

### What the AI Studio prototype got wrong

The security audit found that the prototype:

- committed a Firebase configuration containing an API credential and retained
  it in Git history;
- injected a privileged Gemini key into browser code and called the paid model
  directly from the client;
- mixed public Passport data with material that should have had a separate
  private data boundary;
- logged excessive Firebase identity and provider error details;
- exposed a third-party API proxy without adequate rate limits, caching,
  timeouts, or response validation;
- relied on UI state where production authentication and authorisation would be
  required;
- included remote-fetch/debug artifacts in the application root; and
- had 17 dependency advisories at audit time, including two critical and eight
  high-severity findings.

### What Codex changed

Codex performed the Build Week security rescue before any feature expansion:

- removed the tracked credential-bearing configuration;
- rewrote and force-pushed all reachable Git history after revocation;
- moved Gemini access behind an authenticated, rate-limited server endpoint;
- verified Firebase ID tokens using JOSE rather than trusting browser state;
- added strict request, response, upstream-job, and Passport schemas;
- separated deliberately public Passport fields from private CV material;
- hardened Firestore rules, server headers, origin checks, body limits,
  timeouts, caching, logging, and fail-closed configuration paths;
- removed legacy fetch/debug artifacts;
- updated the dependency graph to zero known npm advisories;
- added redacting working-tree and full-history secret scanners;
- added CodeQL, Dependabot, dependency auditing, type-checking, builds, GitHub
  secret scanning, and push protection; and
- verified the result locally, from a fresh clone, in a production server, in a
  real browser, and again from a fresh post-push GitHub clone.

The sanitised technical record is in
[`SECURITY_REMEDIATION.md`](SECURITY_REMEDIATION.md).

### Where GPT-5.6 was specifically used

GPT-5.6, operating through Codex, was used during Build Week to:

- inspect the complete repository, configuration, dependency graph, browser
  bundle, data rules, API routes, and every reachable Git commit;
- classify findings without printing matched credential values;
- design and implement the client/server trust-boundary changes;
- author validation, rate-limiting, secure logging, origin, and security-header
  controls;
- build the automated secret scanner and GitHub security workflow;
- run clean-install, dependency, build, runtime, browser, fresh-clone, and
  remote-history verification;
- perform the lease-protected history rewrite and GitHub cleanup; and
- create this evidence trail separating pre-existing work from judged work.

GPT-5.6 did not create the pre-Build Week UI screens, themes, Kanban features, or
mock product flows listed above.

### Key architectural decisions

1. **Privileged credentials never enter browser configuration.** `VITE_*` may
   hold Firebase-style public browser identifiers only; it must never contain a
   Gemini, paid-provider, administrative, or private key.
2. **Server routes are the trust boundary.** Paid or privileged operations
   require server-side secrets, authentication, schema validation, throttling,
   and safe errors.
3. **Configuration fails closed.** Unconfigured external integrations return a
   controlled unavailable response instead of falling back to embedded keys.
4. **Public and private candidate data are separate concerns.** Public Passport
   fields cannot silently make CV or application data public.
5. **Git and CI are security controls.** Working-tree scanning, history
   scanning, dependency auditing, CodeQL, push protection, and reproducible
   builds guard future changes.
6. **The next persistence layer is intentionally undecided.** Firebase and
   pay-as-you-go services should remain unconfigured while a local-first or
   replacement database design is evaluated.
7. **Product ordering stays neutral.** Future production work must preserve the
   stated no-paid-promotion and no-algorithmic-ranking model.

### Dated Build Week commits

All timestamps below are Australia/Melbourne time. The commit hashes are the
sanitised hashes after the approved history rewrite.

| Date | Commit | Build Week work |
| --- | --- | --- |
| 21 July 2026, 17:35 | `a25f8cf` | `security: remove exposed client credentials` |
| 21 July 2026, 17:35 | `1336150` | `security: move privileged API access server-side` |
| 21 July 2026, 17:35 | `0ccf74a` | `security: add environment and secret safeguards` |
| 21 July 2026, 17:35 | `d2c9cf5` | `security: add automated scanning and verification` |

Subsequent Build Week work should continue with small, descriptive commits and
update this table when it materially changes the judged submission.

## Local setup

Requirements: Node.js 20 or newer and npm.

```bash
git clone https://github.com/cre8tivoz/cre8tiv-job-board.git
cd cre8tiv-job-board
cp .env.example .env
npm ci
```

For the current local-only phase, do not add real provider credentials. Leave
`GEMINI_API_KEY`, `RAPIDAPI_KEY`, and `FIREBASE_PROJECT_ID` empty in `.env`.
The remaining public Firebase placeholders are legacy bootstrap scaffolding and
must not be mistaken for privileged values. Authentication, AI extraction, and
live paid-provider data are expected to remain unavailable until the replacement
architecture is approved.

Run the development server:

```bash
npm run dev
```

The application uses mock jobs and local browser state for its demonstrable
prototype flows when external integrations are unavailable.

## Tests and security verification

Run the deterministic local verification suite:

```bash
npm run check
```

Run the additional security checks:

```bash
npm run security:secrets:history
npm run security:audit
```

Build and run the production server locally:

```bash
npm run build
NODE_ENV=production npm start
```

`npm run check` performs the TypeScript check, redacting working-tree secret
scan, client build, and server build. The history scanner inspects every
reachable Git blob and prints only finding type and location, never a matched
value.

## Sample and test data

No private production dataset is required.

- [`src/data/mockJobs.ts`](src/data/mockJobs.ts) provides fictional job data.
- [`src/PassportContext.tsx`](src/PassportContext.tsx) provides a fictional
  default Passport profile and project images.
- Application-board entries are created locally by the user and stored only in
  browser `localStorage` in the current prototype.

Do not commit real candidate CVs, identity records, provider responses, or
credentials as sample data.

## Licence

Licensed under the [Apache License 2.0](LICENSE). This permits reuse and
modification while preserving licence and attribution requirements and includes
an express patent licence. Product names and trademarks are not granted by the
software licence.
