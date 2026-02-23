# Phase 1A — Auto-Configuration Spec: “Magic” Invoice Delivery

Purpose: Define the simple, deterministic logic that makes the "Send invoices automatically" wizard truly magical for Phase 1A. The goal is to require zero configuration from the SMB user in normal cases — auto-map CSVs, pick sensible defaults, and recover gracefully with clear business-language messages.

Contents
- Default Logic: CSV auto-mapping heuristics and QuickBooks connect behavior
- Delivery Decision: how the system chooses the delivery method
- Fallback Flow: retry rules, escalation, and fallback to portal
- Behind-the-Scenes Narrative: step-by-step story of a job from wizard completion to delivery
- Observability & Audit: what we log and monitor to ensure "it just works"
- CTO Decision Points: small list of configurable thresholds and policy choices

---

DEFAULT LOGIC — CSV & QuickBooks mapping

Goals:
- Auto-map columns with high confidence and require no user intervention for the common case
- Keep the UI minimal: only ask for confirmation when mapping confidence is low or ambiguous

Heuristics & Rules
1) Header normalization and exact matches
   - Normalize column headers: lowercase, trim whitespace, remove punctuation, collapse spaces
   - Exact header matches (after normalization) to canonical fields: `customer`, `customer_name`, `bill_to`, `email`, `amount`, `total`, `date`, `invoice_date`, `invoice_number`, `description`, `qty`, `item`.
   - If all required fields (customer, amount, date) are present by exact match, confidence = 1.0 and auto-map.

2) Fuzzy header matching
   - If no exact match, apply fuzzy matching (token overlap + substring + Levenshtein) to suggest candidate columns.
   - Example: `cust name` → `customer_name`, `amt` → `amount`.
   - If best fuzzy match score >= 0.75, accept it automatically.

3) Data sniffing for ambiguous headers
   - Sample the first N rows (e.g., 10 rows) and check data type patterns:
     - Date detection (ISO, MM/DD/YYYY, DD-MM-YYYY)
     - Currency/amount detection (digits, currency symbols)
     - Email detection (contains `@`)
   - Increase confidence when column values match expected type for a canonical field.

4) Confidence threshold and UI behavior
   - Confidence >= 0.8 — auto-map, show a 3-row preview with a note: "We auto-detected fields — review below." No extra screen required unless the user clicks **Edit mappings**.
   - Confidence between 0.5 and 0.8 — auto-map and show a one-line warning: "We guessed some columns for you — confirm or fix in the next step." Minimal inline confirmation UI (single Confirm button). If user confirms, proceed.
   - Confidence < 0.5 — show a tiny mapping helper screen (single step) asking the user to confirm mappings (keep it as few clicks as possible: map header X → Customer). Default to helpful suggestions.

5) Missing required fields
   - If required fields are missing after attempts, show business-friendly guidance: "We need Customer, Amount, and Date to send invoices. We can try to map columns for you, or you can re-export from QuickBooks." Provide **Auto-map** (attempt again with more flexible rules) or **Re-upload** options.

QuickBooks API path
- When the user chooses to connect QuickBooks, the system fetches invoices and customers directly. Standardized field names make mapping deterministic.
- On QuickBooks connect, still show the 3-row preview to confirm expected customers and fields.

Default decisions (Phase 1A)
- Default source selection: CSV upload for speed/reliability
- Default mapping behavior: auto-map if confidence >= 0.8; otherwise ask one small confirmation step

---

DELIVERY DECISION — How the system picks delivery method

Phase 1A default: **Encrypted email with PDF attachment**
- Rationale: universal, minimal friction for customers, no partner onboarding required
- We define "encrypted email" for Phase 1A as: PDF files generated server-side, encrypted at rest (S3 encrypted), and delivered via an industry-grade email provider (e.g., AWS SES) over TLS. Password-protected PDFs or end-to-end email encryption are out-of-scope for Phase 1A.

When to deviate from default:
- If the customer selected "Customer portal" explicitly in the wizard, use the portal
- If configured by operator for a specific partner or customer, allow webhook delivery (Phase 1A should support webhooks in pilot mode only)

Delivery method summary for Phase 1A:
1) Preferred: Encrypted email with PDF attachment
2) Optional: Secure portal (fallback or user choice)
3) Optional: Partner webhook (pilot/advanced)

---

FALLBACK FLOW — If delivery fails

Principles:
- Try common-sense automated retries first (transient failures are common)
- Distinguish between transient and permanent failures
- Avoid blocking: if repeated failures occur, create a safe fallback (portal) and notify the user in plain language

Failure classification
- Transient errors: SMTP timeout, temporary provider errors, network issues
- Permanent errors: invalid recipient email address, mailbox disabled, permanent bounce

Retry & fallback policy (recommended defaults)
1) Immediate test send on setup completion: if test succeeds for at least one recipient, mark job Active.
2) On transient failure:
   - Retry schedule:
     - **Email deliveries**: 1st retry after 1 minute; 2nd retry after 10 minutes; 3rd retry after 60 minutes
     - **Webhook deliveries**: up to **3 attempts total**, spaced **5 minutes** apart (attempt 1 immediate, retries at +5m and +10m). Each webhook attempt times out after **30 seconds**.
   - If any retry succeeds, mark delivery succeeded and continue normal operation
   - Log all attempts and statuses for audit
3) On permanent failure (e.g., permanent bounce):
   - Mark that recipient as Failed; do not continuously retry
   - Immediately create a secure portal entry for that invoice and notify the owner and the recipient (if contact email exists)
4) After 3 total failed attempts for a recipient (either transient retries exhausted or permanent failure):
   - System behavior: create portal entry and send a short notification to the SMB user: "We couldn’t deliver invoice #123 to Acme (email bounced). We’ve placed the invoice in a secure download area and will keep trying. You can update the contact or ask us to retry."
   - Allow manual retry from operator UI or user via dashboard (button: **Retry delivery**)
5) If a significant number of deliveries in a batch fail (e.g., >5% for the job) — escalate to operator alerts and surface a top-level banner for the user: "We’re having trouble delivering invoices. Our team is investigating."

Notification & UI
- Users receive simple updates in a timeline and optionally by email when:
  - The first invoice is successfully sent
  - A retry was attempted and succeeded or failed
  - Final fallback activated (portal) for any invoice
- All messages are written in business language and include suggested next steps (e.g., "Update customer email" or "Contact support")

---

BEHIND-THE-SCENES NARRATIVE (Job lifecycle)

This is the story from the moment the user clicks **Start sending invoices**.

1) Wizard completion -> Job creation
   - System records a `DeliveryJob` with metadata: source (CSV file ID or QuickBooks connection ID), customers (list), delivery method, options (notifyOnFirstSend), creation timestamp, job owner (tenant/user).
   - Audit log entry: `JOB_CREATED` with job id and parameters.

2) Initial test & parsing
   - Enqueue `ParseJob` that reads the CSV (or calls QuickBooks API) and produces normalized `Invoice` JSON objects. Store a small schema-validated sample (first N invoices) as `preview` for UI.
   - For CSV path, run auto-mapping heuristics; persist the mapping result and audit event `MAPPING_AUTODETECT` with confidence score. If confidence < threshold and user confirmed mapping, record `MAPPING_USER_CONFIRMED`.

3) Validation
   - Validate required fields for each invoice (customer, amount, date). Invalid rows are flagged; where possible, attempt to auto-correct (trim whitespace, parse dates). If errors remain, mark those invoices `INVALID` and show them in the job UI for operator/user action.

4) Asset generation
   - For each valid invoice, generate a PDF (using a template system). Optionally generate a JSON representation for audit.
   - Store generated PDFs in encrypted storage (S3 with server-side encryption) and record object IDs in DB. Record `ASSET_GENERATED` audit events.

5) Delivery bundling & pre-send test
   - For each customer, create a `DeliveryTask` (possibly grouped per customer) and send a single test message for the first invoice to verify delivery. If `notifyOnFirstSend` is set, wait for that confirmation to notify the user.

6) Delivery attempts
   - For each `DeliveryTask`, attempt to send using the selected delivery method (Email via SES or configured provider).
   - On success, mark `DELIVERED`, record `DELIVERY_SUCCESS` audit event, and update job metrics.
   - On failure, classify error (transient/permanent), schedule retries according to the retry policy, and record `DELIVERY_FAILED` events.

7) Post-delivery & cleanup
   - If delivery succeeded for at least one invoice, mark the job Active and send user notification: "Invoices are now being sent automatically — first invoice sent to Acme Corp."
   - If any invoice permanently fails, create a portal entry and notify the user with suggested actions.
   - Keep PDF artifacts for a short retention window (default **24 hours**) in hot storage; core invoice and audit data retained **7 years** for audit/regeneration; optionally archive if required by retention policy

8) Operations & human-in-the-loop
   - Operators can view job logs and re-run failed deliveries, edit mappings, and correct customer contact info
   - All operator actions are recorded in audit logs (who did what and when)

---

OBSERVABILITY, LOGGING & METRICS

Key metrics to track (Phase 1A)
- `jobs.created` (per tenant)
- `invoices.parsed`, `invoices.invalid`
- `deliveries.attempted`, `deliveries.succeeded`, `deliveries.failed`
- `deliveries.retries` and `deliveries.permanent_failures`
- Test-send success rate

Alerts & dashboards
- Alert when `deliveries.permanent_failures` for a job exceed 1 in 20 invoices (5%) or when overall success rate drops below 95% over 1 hour
- Dashboard: job list with statuses, success rate, average delivery time, retry counts

Audit events (write-only) — minimal set for compliance and debugging
- `JOB_CREATED`, `MAPPING_AUTODETECT`, `MAPPING_USER_CONFIRMED`, `INVOICE_PARSED`, `INVOICE_INVALID`, `ASSET_GENERATED`, `DELIVERY_ATTEMPT`, `DELIVERY_SUCCESS`, `DELIVERY_FAILED`, `PORTAL_CREATED`

Logging
- Include `requestId`, `jobId`, `tenantId`, and `invoiceId` in logs for traceability
- Keep logs for 90 days in hot storage; archive critical audit events per the 7-year retention policy

---

SECURITY & PRIVACY NOTES (Phase 1A minimal)
- Use HTTPS for all endpoints and TLS for email transport
- Store generated PDFs in server-side encrypted storage (S3 SSE) with limited lifetime (default 30 days)
 - Store generated PDFs in server-side encrypted storage (S3 SSE) with limited lifetime (default **24 hours**)
- Do not perform in-email password sharing or client-side PGP in Phase 1A — mark as Phase 1B enhancement
- Ensure access to job data and audit history is RBAC-protected (tenant-scoped)

---

CTO DECISION POINTS & RECOMMENDATIONS

1) Auto-map confidence thresholds
   - Recommend: auto-accept when confidence >= 0.8; simple confirm when between 0.5 and 0.8; prompt mapping when <0.5
   - Decision needed? Confirm thresholds or request more conservative defaults for pilots.

2) Retry schedule
   - Recommend:
     - Email: retries at 1m, 10m, 60m (three attempts total)
     - Webhook: **up to 3 attempts**, spaced **5 minutes** apart (immediate, +5m, +10m); 30s timeout per attempt
   - Decision needed? Confirm or change retry counts/time windows.

3) Retention for generated PDFs (hot storage)
   - **Confirmed**: default **24 hours** in hot storage then delete; core invoice and audit data retained **7 years**. This reduces storage costs while keeping auditability.
   - Decision needed? Increase to 90 days for pilot customers who want more access to history.

4) Definition of "encrypted email" for Phase 1A
   - Recommend: server-side encrypted attachments + TLS in transit via email provider (SES). Full E2E encryption (PGP/S/MIME) is out-of-scope for Phase 1A and will be a Phase 1B add-on if needed.
   - Decision needed? CTO to confirm.

5) Notification policy for repeated failures
   - Recommend notifying the SMB user on final fallback, and optionally notify on first failure only if the job has a high failure rate.
   - Decision needed? Confirm notification thresholds and preferred tone/wording.

---

NEXT STEPS
1. Review and accept auto-map thresholds and retry schedule (CTO decision points).
2. I will create a Mermaid flow diagram if you want a visual to add into `docs/design/` (recommended for architecture onboarding). If approved, I’ll also draft a minimal sequence diagram for the job lifecycle.
3. After sign-off, I will start Task 11: minimal technical architecture (component list, data model for job/invoice/delivery, simple sequence diagram, monitoring endpoints).

If you want, I can also draft the small one-step mapping confirmation UI (compact and optional) that appears only when confidence is low.
