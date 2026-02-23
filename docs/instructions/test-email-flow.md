# End-to-End Email Flow Test (Real SMTP)

Use this guide to validate real email delivery through the Job Orchestrator. This runs locally (not CI) with disposable SMTP credentials and sends to `brockhager@gmail.com`.

## Prerequisites
- Postgres reachable with `DATABASE_URL` set (non-mock).
- Node/pnpm installed.
- A test SMTP account (e.g., Gmail app password or Ethereal). Do **not** commit credentials.

## Required environment
```
DATABASE_URL=postgresql://user:pass@host:5432/db?schema=public
USE_MOCK_DB=false
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=<smtp user or app password email>
EMAIL_PASS=<app password or smtp password>
EMAIL_FROM=<from address>
EMAIL_TO=brockhager@gmail.com
```
Optional envs:
- `CLEANUP=true|false` (default `true`) — whether the script should delete the created test records after a successful run.
- `USE_EMAIL_SIMULATION=true` — force simulation instead of real SMTP (helps debugging without sending mail).
Optional: `USE_EMAIL_SIMULATION=true` to skip real send.

## Run the test
```powershell
$env:DATABASE_URL="postgresql://..."
$env:USE_MOCK_DB="false"
$env:EMAIL_HOST="smtp.gmail.com"
$env:EMAIL_PORT="587"
$env:EMAIL_SECURE="false"
$env:EMAIL_USER="<app-user>"
$env:EMAIL_PASS="<app-password>"
$env:EMAIL_FROM="bridgeflow-test@yourdomain.com"
$env:EMAIL_TO="brockhager@gmail.com"
node scripts/test-email-flow.js
```

## What the script does
1) Creates or reuses an active `email_sender` Resource with the provided SMTP config.
2) Creates a `SEND_INVOICE` job with one task to `EMAIL_TO`.
3) Runs the worker once to process the job.
4) Prints job state, invoice record, and audit logs. The script fails if the job is not `SUCCEEDED`.

## Expected outcome
- Console shows `✅ Email flow test completed — check inbox for delivery`.
- An email arrives at `brockhager@gmail.com`.
- Invoice record exists and audit logs show send/completion events.

## Safety notes
- Use disposable or test-only SMTP credentials; prefer app passwords.
- Never commit `.env` files with secrets.
- For Ethereal, replace host/user/pass/from with provided test values; Ethereal gives a preview URL for received mail.
