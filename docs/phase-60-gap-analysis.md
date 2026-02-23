# Phase 60 Gap Analysis and Update Plan

Date: February 23, 2026

## Executive Summary

The docs repository currently mixes:
- legacy BF-INTEGRATION vision material (pre-Phase 30),
- older marketing docs,
- and partial architecture docs that do not reflect Phases 56-58 live reality.

Revised strategy:
- **Preserve all BF-INTEGRATION content**
- **Re-label and relocate it as Future Vision**
- **Add a new Current System section for live Control Tower**

## 1. What Is Live vs What Is Missing

### Live system facts (present in code, missing/underrepresented in docs)

- TRL 7 validation (Phase 56 live loop)
- Unified `bf-control` deployment serving both API and public frontend (`home/`)
- Public resilience API: `GET /api/v1/public/resilience-status`
- Ingestion API: `POST /api/control/events`
- Customer-facing integration onboarding guide

### Missing sections (must add)

- `Current System` section documenting live Control Tower
- TRL 7 proof/evidence summary for February 20, 2026 validation
- Updated architecture for single-service `bf-control + home/`
- Public API references for live endpoints
- Integration Guide for external developers
- Fresh screenshots from `https://control-tower.up.railway.app/`

## 2. Legacy Content To Preserve and Re-Index

This content is **not obsolete**, but currently unlabeled and hard to distinguish from live-state docs:

- `docs/phases/phases1-10/` (18 files)
- `docs/phases/phases11-20/` (19 files)
- `docs/phases/phases21-30/` (12 files)
- `web/` (13 files)
- `getting-started/` (3 files)
- `guides/` (3 files)
- `api-reference/` (1 file)
- `troubleshooting/` (2 files)
- Layered architecture sets:
  - `docs/Layer0-Admin-Bridgeflow/`
  - `docs/Layer1-BusinessLayer/`
  - `docs/Layer2-ConnectionLayer/`
  - `docs/Layer3-DataMappingLayer/`
  - `docs/Layer4-PlatformCoreLayer/`
  - `docs/Layer5-InfrastructureLayer/`

## 3. Reorganization Plan

### Track A: Current System (Live)

Create and maintain:
- `docs/current/control-tower/README.md`
- `docs/current/control-tower/trl7-validation.md`
- `docs/current/control-tower/public-api.md`
- `docs/current/control-tower/integration-guide.md`

### Track B: Future Vision (Preserved)

Create a future-vision index and route existing design docs through it:
- `docs/roadmap/future-architecture/README.md`

Then migrate or mirror legacy docs into:
- `docs/vision/bf-integration/` (target folder)

with explicit labels:
- `Planned`
- `Historical`
- `Superseded by current implementation` (when applicable)

## 4. Drafts Completed in This Pass

- Root narrative rewrite: `README.md` (Today vs Tomorrow framing)
- New current-system section scaffolding:
  - `docs/current/control-tower/README.md`
  - `docs/current/control-tower/trl7-validation.md`
  - `docs/current/control-tower/public-api.md`
  - `docs/current/control-tower/integration-guide.md`
- Future-vision preservation index:
  - `docs/roadmap/future-architecture/README.md`
- Live screenshot captured:
  - `docs/images/phase-60-control-tower-home.png`

## 5. Next Actions (Execution Order)

1. Add navigation/index links in MkDocs to both Current and Future sections.
2. Migrate top-priority legacy files into `docs/vision/bf-integration/` with labels.
3. Replace root `docs/index.md` content to point users to Current vs Future pathways.
4. Publish docs on GitHub Pages.

## 6. Hosting Setup Proposal (GitHub Pages)

From repository root:

```bash
# if gh CLI is installed
gh repo edit --enable-pages --pages-source=main --pages-path=/
```

If configuring manually:
1. GitHub -> Settings -> Pages
2. Source: `Deploy from a branch`
3. Branch: `main` / folder: `/ (root)`
4. Save

If we decide to publish MkDocs output instead:

```bash
pip install mkdocs
mkdocs gh-deploy
```
