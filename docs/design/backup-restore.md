# Backup & Restore (Phase 12) — Design Draft

## Goal
Provide a reliable Backup & Restore system for BridgeFlow configuration and tenant data (mappings, bridges, templates, organizations, and essential DB state) to support point-in-time recovery and migration across environments.

## Scope (MVP)
- Export/import of tenant-level configuration as JSON (mappings, mappingVersions, bridges, templates, organizations, validation rules).
- Scheduled full backups of the database schema + key tables (Prisma-supported snapshot/export) to a configurable storage backend (S3 or local file for MVP).
- Restore flow to rehydrate a target environment from backup (manual/CLI for MVP).
- Basic integrity checks (schema consistency, optional dry-run verification).

## Non-Goals (MVP)
- Continuous incremental backups or WAL-based point-in-time recovery (PITR) — left for future iterations.
- Cross-region replication.

## Requirements
- Must be usable in both mock/test and production setups.
- Backups should be stored encrypted when using S3 (KMS optional) or local encrypted archive.
- Admin-only endpoints and CLI tools; require operator role and mTLS when in production.

## Components
1. CLI script: `scripts/backup.js` and `scripts/restore.js` (Node): export/import JSON, optional S3 upload/download.
2. Admin API endpoints (protected):
   - POST `/api/admin/backups` — create and optionally upload backup
   - GET `/api/admin/backups` — list backups (from storage metadata)
   - POST `/api/admin/backups/:id/restore` — restore backup to current DB (with dry-run option)
3. Storage adapters: local FS, S3 (pluggable via env vars).
4. Tests: unit tests for exporter/importer; integration tests using `USE_MOCK_DB=true`.

## Security & Operational Notes
- Backup files contain tenant PII; require encryption and limited access.
- Restoration should be manually-confirmed (no automated restores on production without safeguards).
- Provide `--dry-run` to validate compatibility.

## Next Steps (short term)
1. Create design doc (this file) and add task entry in TASK-LIST-3 (done).
2. Add CLI stub `scripts/backup.js` and `scripts/restore.js` with a no-op implementation and tests.
3. Implement JSON exporter (`prisma` read-only) and importer.
4. Add admin endpoints and RBAC guards.

---

Progress: Drafted (Dec 24, 2025). Next: implement CLI stubs and exporter (in-progress).
