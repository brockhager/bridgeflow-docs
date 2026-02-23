# Trading Partner Overview

A Trading Partner (TP) represents an external organization or system that exchanges documents with a customer (an Organization in BridgeFlow). Examples: vendor QuickBooks instance, a CSV mailbox, or a partner gateway that pushes invoices.

Key model: `TradingPartner` (Prisma)
- id: unique identifier
- name: human-friendly name
- type: string (`quickbooks`, `csv_mailbox`, `partner_gateway`, etc.)
- status: `ACTIVE` / `INACTIVE`
- organizationId: tenant-scoped ID (RLS enforced)
- isSelf: boolean (internal partners)
- credentials: optional per-TP connection info (JSON)
- metadata: optional JSON for additional fields
- createdAt / updatedAt: timestamps

Notes:
- Trading Partners are scoped to an Organization (tenant). All API operations read/write with the requesting organization's context.
- The `credentials` field may be used to store non-sensitive display info for UI (e.g., deliveryMethod), while sensitive integration credentials are stored per-organization in `IntegrationCredential` (encrypted).
- Use the `type` field to drive UI and handling logic (e.g., render QuickBooks company name, show CSV summary, accept partner gateway invoices).