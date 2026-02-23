> [!WARNING]
> Status: Planned / In Development
> Context: Original BF-INTEGRATION Vision (Pre-Phase 30)
# Phase 6: Canvas Workspace (Visual Bridge Builder)

## Overview
- **Philosophy:** Make Canvas the central, usable workspace for business users to build and manage bridges visually.
- **Timeline:** Immediate focus (Week 0–2 pilot), iterative delivery thereafter
- **Team:** Agent4 (Lead), A6 (UI/UX & EDI), A7 (Scrum/Coordination)

This document outlines Phase 6: Canvas Workspace (the new priority). It captures objectives, success metrics, epics, a short-term roadmap, and validation criteria focused on delivering a working Canvas and Toolbox experience.

---

## Objectives & Success Metrics

1. Deliver a Level-1 Canvas workspace (visual dashboard)
   - Metric: CTO can open Canvas from Hub and see a functional workspace with sample resources
   - Validation: Manual smoke test + 3 user flows (add sample resources, open canvas, view bridge card)

2. Implement Toolbox & Resource Builder (basic MVP)
   - Metric: User can create and save Folder and API resources via the Toolbox
   - Validation: Create folder resource and API resource, and verify stored in local state

3. Basic Bridge Builder flow
   - Metric: User can start a Bridge: Add Trading Partner → Configure API → Create Bridge → Test → Activate (basic behaviors)
   - Validation: Create a bridge using sample resources and show success message (local flow)

---

## Short-term Roadmap (This week)
- **Day 1:** Canvas foundation and Hub navigation; ensure Canvas loads and shows sample bridges (today)
- **Day 2:** Toolbox MVP + Resource Builder (Folder, API) — create & save resources
- **Day 3:** Bridge Builder wizard (basic create & test flow)
- **Day 4:** Expand resource types (SFTP, webhooks), polish UI
- **Day 5:** Testing, polish, and CTO demo

**Week 2:** Advanced resource types, Trading Partner management, and initial integration testing.

---

## Epics & Deliverables (Initial)
- **Epic A:** Canvas UI foundation — visual workspace, center company card, bridge cards, sample templates
- **Epic B:** Toolbox & Resource Builder — resource list, create/edit resource modal, resource persistence (local storage)
- **Epic C:** Bridge Builder wizard — simple create → save → test flow using resources

---

## Risks & Mitigations
- **Scope creep:** Keep initial feature set minimal and user-focused; add complexity incrementally
- **UX/clarity:** Rapid feedback loop with CTO and product owner to adjust flows

---

## Immediate Next Steps
1. Update Hub navigation (CTA added — done)
2. Ensure Canvas page is reachable and loads sample data (smoke test)
3. Start Toolbox MVP (Folder + API resources) and add basic forms (tonight)
4. Add tests documenting manual flows and acceptance criteria

---

*Prepared: 2025-12-19*
*Owner: Agent4 (Phase 6 Lead)*

