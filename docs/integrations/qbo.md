# QuickBooks Online (QBO) Connector

## Overview
This document describes the QuickBooks Online integration (Phase 19C). The connector allows organizations to securely connect a QBO company and synchronize Purchase Orders (POs) into BridgeFlow's ingestion pipeline. The backend implementation is read-only (no writes to QBO).

## OAuth & Setup
- Redirect URI to register in Intuit Developer Console:
  - https://<your-railway-app>.up.railway.app/oauth/qbo/callback
- Required environment variables:
  - `QBO_CLIENT_ID` — Intuit app client id
  - `QBO_CLIENT_SECRET` — Intuit app client secret
  - `QBO_CREDENTIAL_ENCRYPTION_KEY` — 32-byte hex string (64 chars) used to encrypt credentials (AES-256-GCM)

## Data Flow
1. User connects QBO via OAuth (frontend handles the redirect and authorization flow).
2. The frontend exchanges the authorization code for tokens and sends the encrypted credentials to BridgeFlow (stored in `IntegrationCredential` table).
3. When a user triggers `POST /api/qbo/sync` (authenticated with an org API key), the backend:
   - Loads encrypted credentials (decrypts them using `QBO_CREDENTIAL_ENCRYPTION_KEY`)
   - Calls QBO `PurchaseOrder` query endpoint
   - Maps QBO PO objects to internal format (same as CSV mailbox)
   - Enqueues each mapped payload to Redis Stream `raw_payloads:<organizationId>` with idempotency key `qbo_po:<TxnId>` and `source=quickbooks`
4. Phase 18 pipeline (workers and S3 flush) processes messages, performs deduplication using idempotency keys, and stores original payloads in S3 inbox.

## Limitations & Notes
- Read-only: connector does not write back to QBO.
- POs only: the initial scope covers Purchase Orders only.
- One QBO company per organization (realmId stored in `IntegrationCredential`).
- Rate limiting: the client implements a per-org counter and simple backoff; Intuit limits should be respected (450–500 requests/min).

## Security
- Tokens are stored encrypted using AES-256-GCM (`QBO_CREDENTIAL_ENCRYPTION_KEY`).
- Token refresh is handled server-side; refresh tokens are persisted encrypted and not exposed in logs.
- All endpoints require `x-api-key` (customer API keys) which map to `organizationId` and are validated by `validateCustomerApiKey` middleware.

## Tests
- Unit tests: mapping, client refresh logic, and credential encryption/decryption.
- Integration tests: mock QBO responses validate enqueueing and idempotency behavior.

## Admin / Debugging
- To trigger a sync from server-side: `POST /api/qbo/sync` with header `x-api-key: <org-api-key>`
- Check Redis Stream `raw_payloads:<organizationId>` for queued payloads
- Use existing monitoring dashboards to observe Sync activity and idempotency metrics
