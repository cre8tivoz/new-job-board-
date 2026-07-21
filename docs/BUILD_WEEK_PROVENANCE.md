# Build Week provenance

This file preserves the boundary between the pre-existing Google AI Studio
prototype and OpenAI Build Week work.

## Pre-existing prototype baseline

The repository was cloned from `cre8tivoz/cre8tiv-job-board` on 21 July 2026.
The unmodified upstream baseline was original commit `d6e8ae2` (`docs: replace
default template with project README`). All commits through and including that
commit are pre-existing prototype work. The approved credential-history rewrite
changed every commit identifier; both identities are retained here:

| Original upstream | Sanitised history | Pre-existing summary |
| --- | --- | --- |
| `746cc9b` | `a4b4da8` | Initial commit |
| `51fba1b` | `af172ec` | Initial Cre8tiv Jobs Board prototype import |
| `90f081d` | `695917b` | Prototype animation and Kanban metrics |
| `81f6039` | `619bdb5` | Prototype application-status charts |
| `d6e8ae2` | `a98b1f3` | Prototype README change |

## Build Week boundary

Build Week work begins with sanitised commit `a25f8cf`, the first
security-remediation commit after sanitised baseline `a98b1f3`. Security
remediation intentionally precedes all product feature work.

| Date (Australia/Melbourne) | Commit | Build Week summary |
| --- | --- | --- |
| 21 July 2026, 17:35 | `a25f8cf` | Remove exposed client credentials |
| 21 July 2026, 17:35 | `1336150` | Move privileged API access server-side |
| 21 July 2026, 17:35 | `0ccf74a` | Add environment and secret safeguards |
| 21 July 2026, 17:35 | `d2c9cf5` | Add automated scanning and verification |
| 21 July 2026, 17:55 | `5387f4e` | Preserve Build Week evidence and add Apache-2.0 licensing |
| 21 July 2026, 18:32 | `ae0e1d3` | Replace Firebase-shaped prototype with the secure judged workflow |
| 21 July 2026, 18:33 | `540a466` | Verify permissions and the core product workflow |

The original upstream identifiers remain in this record solely as provenance;
they are not reachable from sanitised `main`.

No pre-existing commit is represented here as security-reviewed or
production-ready.
