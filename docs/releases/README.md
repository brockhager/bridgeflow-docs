# Release Notes

This folder contains monthly release notes for BridgeFlow. Use the `release-<MM>-YYYY.md` filename pattern so files appear in chronological order.

## Current releases
- [January 2026 — release-01-2026](release-01-2026.md)

## See also
- Project docs index: `../README.md` — lists beginner guides, phases, and key references
- Phases: `../phases/readme.md` — development phases and links to phase groups

## How to add a new release
1. Create a new file `release-<MM>-YYYY.md` (e.g., `release-02-2026.md`).
2. Use the same structure as `release-01-2026.md`:
   - Header with date
   - Highlights (brief bullets with links to docs)
   - Validation / smoke checks (commands)
   - CI / artifacts references
   - Contact and follow-up
3. Commit the file and add an entry to this README under "Current releases".

## Suggested one-line release format (for changelogs)
`Phase 35 — Profile Templates: Completed Jan 11, 2026 — validated template library, auto-versioning, enterprise gating (Playwright E2E green).`

If you'd like, I can also add a one-line entry to your top-level `README.md` or add an aggregated `docs/CHANGELOG.md` that lists these one-line entries.
