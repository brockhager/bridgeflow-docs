> [!WARNING]
> Status: Planned / In Development
> Context: Original BF-INTEGRATION Vision (Pre-Phase 30)
# Layer 3 — Data Mapping: QuickBooks Purchase Orders

This document explains how QuickBooks Online (QBO) Purchase Orders are mapped into BridgeFlow's Layer 3 Data Mapping Layer.
It documents the mapping choices, validation, template alignment with CSV mailbox, and suggestions for future mapping extensions.

## Goal
- Ensure QBO-sourced Purchase Orders are normalized to the same internal schema used by CSV mailbox ingestion so downstream mapping, validation, and delivery pipelines are unified and reusable.

## Input (QBO PurchaseOrder)
- Typical relevant fields:
  - `Id` (TxnId) — primary identifier
  - `DocNumber` — human-facing PO id
  - `EntityRef.value` — vendor id
  - `Line[]` — line items (various detail types: `ItemBasedExpenseLineDetail`, `SalesItemLineDetail`, etc.)

## Internal Target Schema (same as CSV mailbox)
- `purchaseOrderId` (string) — prefer `DocNumber` when available; fall back to `Id`
- `vendorId` (string) — maps from `EntityRef.value`
- `lineItems` (array of objects):
  - `itemId` (string)
  - `quantity` (number|null)
  - `unitPrice` (number|null)

Rationale: Aligning with CSV shape means existing mapping templates and validation rules are applied unchanged.

## qboToInternal Mapping Rules
- Use `DocNumber` as `purchaseOrderId` when provided, else `Id`
- For each `Line`:
  - If `DetailType === 'ItemBasedExpenseLineDetail'` and detail exists:
    - `itemId` = `ItemBasedExpenseLineDetail.ItemRef.value`
    - `unitPrice` = `ItemBasedExpenseLineDetail.UnitPrice || Amount`
    - `quantity` = if `UnitPrice` and `Amount` available, compute `Amount / UnitPrice`, otherwise fallback to `Quantity` when available
  - If `SalesItemLineDetail` present:
    - `itemId` = `SalesItemLineDetail.ItemRef.value`
    - `quantity` = `SalesItemLineDetail.Qty`
    - `unitPrice` = `Amount`
  - Otherwise, use best-effort mapping from `ItemRef`/`Quantity`/`Amount`

## Validation & Mapping Templates
- After mapping, the payload is fed into existing Mapping & Validation layers (Layer 3):
  - Reuse CSV mapping templates for `purchase_order` where possible
  - Validation rules apply identically (e.g., required fields, format checks)

## Idempotency Interaction
- Each mapped PO is assigned an idempotency key `qbo_po:<Id>` at the producer (Layer 2) before enqueuing to the raw stream.
- Layer 3 mapping/worker components do not need to re-compute idempotency — they rely on Phase 18 deduplication logic and stored IdempotencyKey records.

## Extensibility
- Add support for additional QBO objects (Invoices, Bills) by creating `qboToInternal` mappers for each object and adding new `source` fields on the raw stream.
- Consider adding a richer line-level mapping that preserves QBO detail types for advanced mappings in the admin UI.

## Testing
- Unit tests for `qboToInternal` must cover: varied line detail types, missing fields, and fallbacks.
- Integration tests should validate end-to-end: QBO response → mapping → enqueue → downstream processing.

## Files & References
- Implementation: `api/lib/qboToInternal.js`
- Mapping unit test: `test/api/qboToInternal.test.js`
- Ingestion producer: `api/ingest/qboSync.js`
- Downstream processing: Phase 18 workers and S3 flush worker

---
Addendum: If we later add a UI to let operators preview mapping results, ensure the preview UI displays both original QBO fields and mapped output for easier debugging and template tuning.
