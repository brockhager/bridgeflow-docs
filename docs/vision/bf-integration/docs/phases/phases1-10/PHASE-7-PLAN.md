> [!WARNING]
> Status: Planned / In Development
> Context: Original BF-INTEGRATION Vision (Pre-Phase 30)
# Phase 7: Lean API Platform + EDI Expansion

## Overview
- **Philosophy:** Depth over breadth, quality over quantity
- **Timeline:** Q1 2026 (8–10 weeks)
- **Team:** Agent4 (Lead), A6 (EDI Specialist), A7 (Scrum/Coordination)

This document captures objectives, success metrics, epics, milestones, risks, dependencies, and validation for Phase 7 (formerly planned as Phase 6). It preserves the original plan and timeline so Phase 7 can be kickstarted when Phase 6 Canvas work completes.

---

## Objectives & Success Metrics

1. Complete Wizard Integration (T-004 continuation)
   - Metric: User can send an invoice start→finish in < 5 minutes via the wizard
   - Validation: 3 successful E2E tests (create → send → delivered) run automatically

2. Essential API Platform (Minimal, well-documented)
   - Metric: Developer can create jobs and automate via API (examples + SDK)
   - Validation: Example SDKs (Node.js/Python) show working flows; OpenAPI docs pass linting

3. EDI Architectural Refactor (increase velocity and maintainability)
   - Metric: Post-refactor, onboarding a new transaction takes 2–3 days (target) vs 5–7 today
   - Validation: Refactor 2 transactions as pilot, run full test suite, preserve round-trip parity

---

## Detailed Epics

### Epic 1: Wizard → Job Orchestrator Integration
- Connect Wizard UI to backend job API (secure endpoints)
- Real email provider integrations (SendGrid, fallback to Ethereal for testing)
- Basic monitoring dashboard for job status & delivery metrics
- Robust error handling & user-facing feedback

Deliverables: API endpoints, UI wiring, provider connector, monitoring dashboard, E2E tests


### Epic 2: Minimal External API Platform
- Core REST endpoints: jobs, job status, webhooks, bridges
- API key authentication and simple token lifecycle
- Basic rate limiting primitives and request quotas (configurable per-owner)
- OpenAPI (Swagger) documentation and SDK starter (Node.js/Python)
- Tests: contract tests and example scripts

Deliverables: API routes, middleware, rate-limiter, OpenAPI docs, SDK starters, tests


### Epic 3: EDI Foundation Refactor
- Design element/segment primitives and serialization/validation primitives
- Refactor parser/generator to use primitives (start with 2 transactions: pick high-impact ones)
- Performance benchmarking and correctness verification (round-trip tests)
- Extend library for additional transactions and edge-case coverage

Deliverables: design doc, primitives library module, migrated transactions, benchmark report

---

## Milestones & Timeline (Draft)
- **Week 1–2:** Epic 1 complete (Wizard wiring, provider integrations, monitoring)
- **Week 3–4:** Epic 2 complete (API endpoints, auth, rate limiting, docs, SDK starters)
- **Week 5–8:** Epic 3 (EDI refactor pilot, transactions migration, benchmarking)
- **Week 9–10:** Stabilization, testing, documentation, and retrospective

Notes: Treat timeline as tentative — update as we scope E2E tests and provider access windows.

---

## Next Steps
1. Preserve this plan for Phase 7 kickoff after Phase 6 Canvas delivery
2. Re-prioritize epics and assign owners when Phase 6 is sufficiently validated
3. Prepare provider test accounts and CI validation steps to accelerate Epic 1

---
*Prepared: 2025-12-19*
*Owner: Agent4 (Phase 7 Lead)*

