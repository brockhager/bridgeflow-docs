> [!WARNING]
> Status: Planned / In Development
> Context: Original BF-INTEGRATION Vision (Pre-Phase 30)
# Phase 25: PO-to-Acknowledgment Cycle — Complete Scope ✅

**Status:** Complete — ready for pilot deployments

This document captures the full Phase 25 scope and verification checklist. This is a production-ready B2B integration workflow for EDI 210 → 997 acknowledgments.

## 1. Document Ingestion
- POST `/api/documents` accepts raw EDI 210 (text/plain or JSON payload with content string)
- Validates basic syntax
- Stores received payload in the Document table with status = `RECEIVED`

## 2. Real EDI Parsing
- Uses `x12-parser` to parse EDI 210
- Extracts key fields: shipmentId (BSN), weight & weightUnit (L5), sender and receiver
- Returns structured JSON used by downstream mapping

## 3. Mapping Engine
- Applies organization-specific mapping rules (stored on `Mapping`)
- Transforms parsed 210 → canonical internal format (example: `{ externalId, totalWeight, weightUnit, sender }`)
- Stores mapping result in `Document.canonicalContent`

## 4. Acknowledgment Generation
- `generate997.js` creates a valid EDI 997 acknowledgment from the original 210
- Swaps sender/receiver in ISA/GS for the ACK
- Uses original control numbers where applicable
- Sets `AK5*A` (accepted) for now (success case)
- Stores generated 997 in `Document.ackContent`
- Updates document `status` to `ACK_GENERATED`

## 5. ACK Access
- `GET /api/documents/:id/ack` returns the plain-text 997 (Content-Type: text/plain)
- Returns 404 if no ACK exists for the document

## 6. Data Model (Document)
Key fields used by Phase 25:
- `content` (raw EDI payload)
- `canonicalContent` (mapped JSON)
- `ackContent` (generated 997 EDI)
- `status` (RECEIVED → PARSING → PROCESSED → ACK_GENERATED)
- `organizationId` and tenant/ownership fields (used for RBAC)

> Note: internally we store the raw EDI as `content` (phase semantics document it as rawContent for clarity).

## 7. Testing
- Unit tests:
  - `edi210.test.js` (parser)
  - `applyMapping.test.js` (mapper)
  - `generate997.test.js` (997 generator)
- Integration tests:
  - End-to-end ingestion → mapping
  - End-to-end ACK generation → retrieval via `/api/documents/:id/ack`

## 8. Demo & Docs
- `start/start-ctodemo.ps1` demonstrates the flow: sends a sample 210 and fetches the generated 997
- This file (`docs/phases/phase25-complete.md`) documents the milestone and verification steps

---

## Not in Phase 25 (Saved for Phase 26+)
- Job queues and background workers for async processing
- Email/SMS alerts / external notification channels
- `/alerts` dashboard and live monitoring UI
- Built-in retry logic and retry policies
- Support for additional transaction sets (850, 810, etc.)

---

This milestone completes the core PO → ACK cycle for EDI 210 and is ready for pilot testing and initial production use.

— BridgeFlow Team
