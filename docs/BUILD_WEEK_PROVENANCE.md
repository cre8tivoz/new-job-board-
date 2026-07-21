# Build Week provenance

This file preserves the boundary between the pre-existing Google AI Studio
prototype and OpenAI Build Week work.

## Pre-existing prototype baseline

The repository was cloned from `cre8tivoz/cre8tiv-job-board` on 21 July 2026.
The unmodified upstream baseline was commit `d6e8ae2` (`docs: replace default
template with project README`). All commits through and including that commit
are pre-existing prototype work:

| Commit | Pre-existing summary |
| --- | --- |
| `746cc9b` | Initial commit |
| `51fba1b` | Initial Cre8tiv Jobs Board prototype import |
| `90f081d` | Prototype animation and Kanban metrics |
| `81f6039` | Prototype application-status charts |
| `d6e8ae2` | Prototype README change |

## Build Week boundary

Build Week work begins with the first security-remediation commit after
`d6e8ae2`. Security remediation intentionally precedes all product feature
work. If the exposed credential is removed from Git history, the rewritten
commit identifiers will change; this record retains the original upstream
identifiers solely as provenance.

No pre-existing commit is represented here as security-reviewed or
production-ready.
