# Local Testing Guide — Mock DB + Ethereal

This document describes how to run the end-to-end email delivery validation using the in-memory Mock DB and Ethereal (disposable SMTP).

Why use this flow
- No Docker or local Postgres required — works on Windows, macOS, Linux
- No real SMTP credentials needed (Ethereal provides ephemeral inboxes)
- Repeatable and isolated using the Mock DB

Files
- `scripts/test-email-flow.js` — test runner that creates a test `email_sender` Resource, creates a `SEND_INVOICE` job, runs the worker, and validates invoice creation.
- `api/lib/emailSender.js` — nodemailer-based transport that returns preview URLs for Ethereal.
- `api/worker/simulatedWorker.js` — worker which writes preview URL and subject/body into `AuditLog.meta` for test visibility.

Env vars (recommended for PowerShell)
```powershell
$env:USE_MOCK_DB="true"
$env:USE_ETHEREAL="true"
$env:EMAIL_FROM="bridgeflow-test@example.com"
$env:EMAIL_TO="brockhager@gmail.com"
$env:CLEANUP="true"   # default; set to false to keep records for debugging
node scripts/test-email-flow.js
```

Run steps
1. Ensure dependencies are installed: `pnpm install`
2. Run the test as shown above.
3. The script will print a preview URL (Ethereal) and a small email summary (subject and truncated body). Open the preview link to view the message.

Cleanup
- By default `CLEANUP=true` and the script will reset the mock DB or delete created records (best-effort) when running against a real DB.
- To keep artifacts for debugging, set `CLEANUP=false`.

Troubleshooting
- If the script errors with missing DB: ensure `USE_MOCK_DB=true` or set `DATABASE_URL` to a reachable Postgres instance.
- If Ethereal preview doesn't appear in audit logs, ensure `USE_ETHEREAL=true` and that the worker processed the job (the script will run the worker several times to allow retries/backoff).

Notes
- This approach validates the full delivery stack (job creation, worker lifecycle, email transport) safely.
- For Postgres-based testing or CI integration, see developer runbooks or contact the platform team to provision a test DB or fix Docker on Windows.
