> [!WARNING]
> Status: Planned / In Development
> Context: Original BF-INTEGRATION Vision (Pre-Phase 30)
# Layer 2 — QuickBooks Online (QBO) Connector

This document describes how the QBO connector fits into **Layer 2 (Connection Layer)** of BridgeFlow.
It covers the connection lifecycle, security, operational behaviors, and how QBO syncs are enqueued into the Phase 18 ingestion pipeline.

---
## Purpose
- Provide a secure, tenant-scoped connector that lets organizations pull Purchase Orders from QuickBooks Online into BridgeFlow.
- Keep connection responsibilities scoped to Layer 2: authentication, credential management, and upstream payload delivery to Layer 3/4 processing.

## High-level flow
1. Frontend performs OAuth 2.0 authorization with Intuit (QBO). Frontend exchanges authorization code for tokens.
2. Frontend sends encrypted credentials to backend (stored in `IntegrationCredential` table in `public` schema).
3. User triggers `POST /api/qbo/sync` (backend) to fetch POs and enqueue mapped payloads into `raw_payloads:<orgId>`.
4. Phase 18 pipeline (workers) processes, deduplicates (idempotency), and stores payloads in S3 inbox for downstream workflows.

## Key responsibilities (Layer 2)
- Credential persistence (encrypted at rest)
- Token refresh and secure handling (no tokens leaked in logs)
- Rate limiting and backoff when calling QBO
- Mapping to internal payload format (same shape as CSV mailbox) and producing to `raw_payloads` stream
- Cooperative idempotency: ensure same QBO TxnId is not enqueued more than once within TTL

## Data model
- Prisma model: `IntegrationCredential`
  - id: cuid()
  - organizationId: String @unique
  - encryptedData: Bytes (AES-256-GCM encrypted JSON blob)
  - createdAt: DateTime

## Security & Encryption
- Use Node Web Crypto (AES-256-GCM) to encrypt credential JSON before storing.
- Derive the encryption key from environment variable `QBO_CREDENTIAL_ENCRYPTION_KEY` (32 bytes in hex; 64 hex chars).
- Rotation: rotate key only via an ops process — rotating the key requires re-encrypting stored credentials.
- Tokens and refresh flows are never logged or returned.

## Endpoints / RPCs
- POST /api/qbo/sync
  - Auth: `x-api-key` → validated via `validateCustomerApiKey` middleware (maps to `organizationId`)
  - Pre-handlers: rate limiting (same as ingest/CSV endpoints)
  - Behavior: calls `syncQboPurchaseOrders(orgId)` which fetches, maps and enqueues POs; returns `{ enqueued: n }`.
- (Frontend) OAuth redirect flow: handled by frontend; backend exposes credential storage and refresh handling.

## Idempotency
- Producer-side idempotency: each PO uses idempotency key `qbo_po:<TxnId>`.
- The ingestion producer checks `IdempotencyKey` (Prisma model) to skip already-processed POs within TTL (configurable via `IDEMPOTENCY_TTL_HOURS`).
- This aligns with Phase 18 deduplication policy and avoids duplicate processing on retries.

## Rate limiting
- Implement a per-org Redis counter `qbo:rate:<orgId>` with a soft cap at ~450/min.
- On exceeding, the client will use a backoff delay; production should observe Intuit limits and adjust accordingly.

## Observability & Tests
- Add metrics for:
  - `qbo.sync.enqueued_total`
  - `qbo.sync.failures`
  - `qbo.sync.refreshes`
- Tests:
  - Unit: qbo client (refresh logic), encryption helpers, mapping tests
  - Integration: mock QBO responses, call `/api/qbo/sync`, assert messages enqueued and idempotency behavior

## Limitations & Notes
- Read-only integration for Purchase Orders only (no writes to QBO).
- One QBO company/realm per organization.
- Admins should rotate credentials carefully; no automatic key rotation is provided yet.

---
## Operational Playbook (short)
- If sync failures spike, check:
  - QBO token expiry / refresh errors
  - Redis `qbo:rate:<orgId>` counter (rate limit backoffs)
  - Idempotency keys growth and prune job
- For manual sync: admins can call `POST /api/qbo/sync` with a valid org API key.

---
Reference: Implementation files: `api/lib/qboClient.js`, `api/lib/qboToInternal.js`, `api/ingest/qboSync.js`, `api/handlers/qbo.js`, `prisma/schema.prisma` (IntegrationCredential model).
