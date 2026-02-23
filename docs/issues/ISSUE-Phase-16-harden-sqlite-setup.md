Title: Phase 16: Harden SQLite test setup script

Description:
The `scripts/setup-sqlite-test-db.js` script generates a minimal SQLite-compatible schema. Improvements needed:
- Better error handling and clearer failure messages when `prisma db push` or `prisma generate` fail
- Caching or re-use of the generated Prisma client to speed CI runs and avoid repeated `prisma generate`
- Validation that required models are present in the generated schema (e.g., Organization, User, UserOrganization, TradingPartner)
- Add a small smoke test to verify the SQLite setup before running the full integration suite

Labels: phase-16, tech-debt, backend
Priority: Medium

Notes:
- Current script works but was updated as a minimal compatibility workaround; this issue tracks hardening and follow-ups for Phase 16 persistence work.
