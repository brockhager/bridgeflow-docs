# Phase 16 Kickoff Agenda — Persistent Storage (TPs & Bridges)

**Purpose**
- Align stakeholders on Phase 16 goals: implement persistent storage for Trading Partners (TPs), Bridges, and follow-on entities; define MVP, scope, tech choices, and migration strategy.

**Proposed duration:** 30 minutes
**Attendees:** CTO, Product Lead, Engineering Lead, Backend Engineer(s), QA, (optional) DevOps

---

## 1) Opening (3 min)
- Quick Phase 15 recap & CTO sign-off (status: DONE)
- Objective for this meeting: decide Phase 16 goal, MVP, storage tech direction, and first tasks

## 2) Goal & Success Metrics (5 min)
- Proposed goal: Provide durable, queryable persistent storage for TPs and Bridges so user workflows persist across restarts and re-deploys
- Success metrics (example):
  - MVP stores and retrieves TPs and Bridges reliably (CRUD) in production-like environment
  - Migration path completed for seed/dev data; CI tests exercise new storage
  - End-to-end TP→Bridge creation flow validated via integration tests

## 3) Scope & Priority (5 min)
- Minimal scope (MVP):
  1) Trading Partners (TPs) — create, list, update, delete
  2) Bridges — CRUD and association with TPs
  3) Basic migration tooling + tests
- Phased additions: transactions, templates, mappings (later phases)

## 4) Storage Technology Options (5 min)
- Short analysis:
  - SQLite (local/dev-friendly, simple migrations) — good for MVP & dev envs
  - Postgres (recommended for production parity) — harder to migrate but scalable
  - Use existing Prisma setup (we already have `prisma/schema.prisma`) — prefer Postgres for prod, SQLite for local/dev/CI where appropriate

## 5) Migration Strategy & API Changes (5 min)
- Options: write-new + backfill vs inline migrations
  - Suggestion: implement new schema support with feature flag; migrate new writes to persistent storage first and plan backfill/porting later (minimizes risk)
  - Add tests in `test/` and CI scripts (e.g., `pnpm prisma:migrate` in a job using ephemeral DB)

## 6) Tech Debt & Risks (3 min)
- Link Vitest Exclusions issue: https://github.com/brockhager/bridgeflow/issues/5 (Phase 16 tech-debt)
- Risk: test-runner compatibility, DB connection config, secrets and deployment changes

## 7) Next Steps & Ownership (2 min)
- Define immediate 1–2 week tasks (spike, schema changes for TPs, migration test) and assign owners
- Decide meeting cadence for Phase 16 planning (weekly syncs)

---

**Artifacts / Links**
- Vitest tech-debt: `docs/phases/PHASE-16-vitest-exclude-TECHDEBT.md` (and issue #5)
- Schema reference: `prisma/schema.prisma` (models: `TradingPartner`, `Bridge`)

**Proposed times for kickoff:** Today AM or tomorrow 9–11am — pick a 30-minute slot.

---

_Notes:_ I can post this agenda to issue #5 and create the storage plan doc next (draft `docs/PHASE16-storage-plan.md`) if you'd like me to continue. 