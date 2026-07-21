# Security remediation

Status: critical fixes verified, affected credentials revoked, and the
credential-bearing path removed from rewritten Git history.

Date: 21 July 2026 (Australia/Melbourne)

This report is deliberately sanitised. It identifies credential types and
locations but contains no credential values, private URLs, tokens, or copied
secret material.

## Scope and baseline

The audit covers the complete tracked repository, all five reachable baseline
commits, configuration files, browser/server environment handling, Firebase
rules, Express API routes, authentication boundaries, dependency advisories,
and legacy prototype artifacts. The pre-Build Week baseline is recorded in
`docs/BUILD_WEEK_PROVENANCE.md`.

## Prioritised findings and remediation

### P0 - committed credential in reachable history

- Discovery: a Google/Firebase API credential was committed in
  `firebase-applet-config.json` by baseline commit `51fba1b` and remains in the
  trees of baseline commits `90f081d`, `81f6039`, and `d6e8ae2`.
- Working-tree fix: the tracked configuration file was removed, ignored, and
  replaced with placeholder-only environment documentation. Client Firebase
  configuration now comes from explicitly public `VITE_FIREBASE_*` variables.
- External action: credential revocation is confirmed. The owner also
  disconnected the AI Studio project from this repository and requested that
  Firebase and pay-as-you-go integrations be rolled back there. No replacement
  credential is stored in this repository.
- History status: the credential-bearing path was removed from every commit on
  rewritten `main`, then the complete rewritten history was rescanned.

### P0 - privileged Gemini credential shipped to browser code

- Discovery: `vite.config.ts` injected `GEMINI_API_KEY` into the client bundle,
  and `src/pages/CreationWizard.tsx` instantiated the Gemini SDK in the browser.
  CV text and the credential therefore crossed the client trust boundary.
- Fix: browser injection and the client SDK call were removed. CV extraction is
  now a bounded server endpoint that requires a verified Firebase ID token,
  same-origin browser requests, strict request/response schemas, rate limits,
  a body-size limit, and generic error responses. The server does not log CV
  text or credential values.

### P0 - vulnerable dependency graph

- Discovery: the baseline lockfile reported 17 advisories, including two
  critical and eight high severity findings.
- Fix: direct dependencies were updated to patched release lines. The
  server-side authentication design uses JOSE verification rather than a large
  privileged SDK dependency tree. The final audit reports zero known npm
  advisories; high-severity findings block CI.

### P1 - unauthenticated third-party API cost and response boundary

- Discovery: `/api/jobs` proxied a paid upstream service without rate limits,
  caching, timeouts, or response validation.
- Fix: the route now fails closed when unconfigured and applies rate limiting,
  a short cache, an upstream timeout, strict response bounds, and generic
  failures. The upstream credential remains server-only.

### P1 - excessive identity and error logging

- Discovery: Firestore errors serialised user identifiers, email addresses,
  provider records, and upstream error details into browser logs and thrown
  errors.
- Fix: logging now records only the operation and error class. API failures use
  safe labels and never serialise request bodies, tokens, headers, or provider
  errors.

### P1 - public Firestore document boundary was too broad

- Discovery: public passport documents accepted loosely bounded maps and a
  resume field. Firestore cannot hide selected fields from a publicly readable
  document, so a persistent resume URL would also become public.
- Fix: rules now enforce an exact public schema, owner-only writes, server
  timestamps, bounded nested project records, and HTTPS-only persistent media
  references. Resume data is excluded from persistent public documents. A
  future private CV store must use a separate owner-only collection and storage
  rules.

### P1 - legacy prototype artifacts increased attack surface

- Discovery: root-level fetch scripts could retrieve remote content, print it,
  or overwrite a large standalone prototype page. The standalone page was
  directly addressable during Vite development and used an unrelated inline
  security model.
- Fix: `fetch.js`, `fetch.cjs`, and `neo.html` were removed from the production
  tree. Their origin remains evident in the pre-Build Week Git baseline.

### P2 - browser and server hardening

- Fixes: Helmet security headers, a production Content Security Policy,
  no-referrer policy, disabled Express signature header, bounded JSON parsing,
  API-wide throttling, explicit API 404s, and no permissive CORS middleware.
  The authenticated mutation route also checks the browser origin.
- Fixes: a redacting secret scanner, weekly dependency checks, CodeQL,
  Dependabot, type-checking, and production builds are automated in GitHub
  Actions.

## Browser environment boundary

Only variables prefixed with `VITE_` are permitted in client code. The Firebase
web configuration is a public browser identifier and will be present in the
client bundle by design; it is not an authorisation control. Its protection is
Firebase Authentication, restrictive Firestore/Storage rules, authorised
domains, and Google API-key restrictions. `GEMINI_API_KEY`, `RAPIDAPI_KEY`, and
all future privileged credentials are server-only and must never use the
`VITE_` prefix.

## Authentication and authorisation notes

- Google sign-in remains a Firebase browser flow.
- The server verifies Firebase ID-token signature, issuer, audience, algorithm,
  expiry, and subject before allowing AI extraction.
- Firestore owner writes are enforced by security rules, not by hidden UI.
- Studio, job-posting, payment, review, and application screens are prototype
  UI only. They must not be treated as production authorisation boundaries or
  connected to privileged writes until dedicated server-side roles and data
  models are implemented.

## History rewrite completed

After credential revocation and explicit owner approval, the configuration file
was removed from every commit on `main`. The rewrite changed all nine reachable
commit identifiers, including the four staged remediation commits. Rewritten
`main` was fully rescanned before publication.

Existing clones, forks, caches, and previously fetched objects do not
automatically lose the old blob. Collaborators must re-clone or carefully
rebase. Revocation remains the primary containment measure regardless of the
history cleanup.

## Deployment requirements

- Keep Firebase and pay-as-you-go integrations unconfigured during the current
  local-only phase; their routes fail closed without credentials.
- Remove or redesign the remaining integration scaffolding when the replacement
  database architecture is selected.
- If any future server integration is approved, store its credentials in the
  deployment platform's encrypted environment settings, never repository files.
- Enable GitHub secret scanning and push protection in repository settings.
- Keep the AI endpoint disabled until authentication configuration is present;
  it fails closed when configuration is absent.

## Verification commands

```bash
npm ci
npm run lint
npm run security:secrets
npm run security:audit
npm run build
NODE_ENV=production npm start
```

The history-only scanner verifies every reachable rewritten blob:

```bash
npm run security:secrets:history
```

## Verification result

- TypeScript type-check: passed.
- Working-tree secret scan: passed with secret values suppressed by design.
- History scan: passed after rewriting and removing legacy local refs.
- npm advisory audit: zero known vulnerabilities.
- Production client and server builds: passed.
- Production HTTP smoke test: root and health routes returned success; the
  unconfigured paid jobs integration failed closed; cross-origin mutation was
  rejected; unauthenticated mutation was rejected; expected Helmet headers
  were present.
- Browser smoke test: the landing page rendered with non-secret test Firebase
  identifiers. The only console error was the expected fail-closed response
  from the deliberately unconfigured live-jobs integration.
