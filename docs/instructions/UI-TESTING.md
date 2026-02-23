# UI Testing Guide — Canvas + Wizard End-to-End Flow

This guide explains how to test the complete user interface flow, from the Canvas landing page through the wizard to backend job execution and email delivery.

## Overview

The BridgeFlow UI consists of:
- **Canvas Landing Page** (`web/canvas.html`) - Shows available workflow cards
- **Wizard** (`web/index.html`) - 5-step invoice automation setup wizard
- **Backend API** (`api/server.js`) - Handles job creation and execution
- **Worker** (`api/worker/simulatedWorker.js`) - Processes jobs and sends emails

## Quick Start (Development Mode)

### 1. Start the API server with dev worker

```bash
# PowerShell
$env:USE_MOCK_DB="true"
$env:NODE_ENV="development"
node api/server.js
```

This will:
- Start the API server on port 4000
- Serve the web UI at http://localhost:4000
- Auto-start the worker loop (processes jobs every 5 seconds)
- Use the in-memory mock database (no Postgres required)

### 2. Open the Canvas page

Open your browser to: http://localhost:4000/canvas.html

You should see:
- A "BridgeFlow Workflows" header
- A workflow card titled "Send invoices automatically"
- A "Setup now" button

### 3. Test the wizard flow

1. Click "Setup now" - The wizard opens in a modal
2. Navigate through the wizard steps:
   - **Welcome**: Click "Start setup"
   - **Source**: Select "Upload invoice CSV" (recommended)
   - **Customer**: Select "All customers" or choose specific customers
   - **Delivery**: Select "Encrypted email with PDF" (default)
   - **Review**: Click "Start sending invoices"

3. Watch the job progress modal:
   - The modal shows a 4-step progress indicator
   - Steps: Preparing → Mapping Data → Sending → Complete
   - During "Sending", you'll see a live percentage (e.g., "10%... 30%... 95%...")

4. Success screen:
   - On completion, you'll see: "Success — First invoice sent"
   - Click "View Sent Invoice" to see the invoice HTML
   - Click "Done" to close the modal and return to Canvas

5. Success notification:
   - A green notification appears in the bottom-right corner
   - Shows the job ID that was created

## Testing with Real Emails (Ethereal)

To see actual email delivery with preview URLs:

```bash
# PowerShell
$env:USE_MOCK_DB="true"
$env:NODE_ENV="development"
node api/server.js
```

Then, before creating a job through the UI, you need to seed an Ethereal resource. Run the test script once to create it:

```bash
pnpm exec cross-env USE_MOCK_DB=true USE_ETHEREAL=true EMAIL_FROM=bridgeflow@test.ethereal.email EMAIL_TO=test@example.com CLEANUP=false node scripts/test-email-flow.js
```

This will:
- Create an Ethereal test email account
- Print the Ethereal web login URL
- Create a test job and send an email
- Leave the Ethereal resource in the mock DB for subsequent UI tests
- Print the preview URL where you can view the sent email

After that, use the UI as normal. The worker will use the Ethereal resource and log preview URLs in the console.

## Manual Testing Checklist

### Canvas Page
- [ ] Canvas page loads and displays workflow card
- [ ] Workflow card shows correct title and description
- [ ] "Setup now" button opens the wizard modal
- [ ] Modal has a close button (X) in the top right
- [ ] Clicking outside the modal (backdrop) closes it
- [ ] Pressing ESC key closes the modal

### Wizard Navigation
- [ ] Wizard displays current step (1/5, 2/5, etc.)
- [ ] Step indicators highlight the active step
- [ ] "Next" button advances to the next step
- [ ] "Back" button returns to the previous step
- [ ] All 5 steps can be navigated successfully

### Wizard Inputs
- [ ] Source selection (CSV vs QuickBooks) is saved
- [ ] Customer selection (all vs select) is saved
- [ ] Delivery method (email, portal, partner) is saved
- [ ] Review screen shows all selected options correctly

### Job Execution
- [ ] Clicking "Start sending invoices" opens the progress modal
- [ ] Progress modal shows all 4 steps
- [ ] Steps transition correctly (Preparing → Mapping → Sending → Complete)
- [ ] "Sending" step shows live percentage updates
- [ ] Percentage increases from 0% to 100%
- [ ] On success, the modal updates to show "Success — First invoice sent"
- [ ] Job ID is displayed and can be viewed

### Error Handling
- [ ] If the API is not running, an error is shown
- [ ] If job creation fails, an error message is displayed
- [ ] "Retry" button attempts to create the job again
- [ ] "Close" button dismisses the error modal

### Backend Integration
- [ ] POST /api/jobs creates a job successfully
- [ ] Job includes customers array from the wizard state
- [ ] GET /api/jobs/:id returns job status and progress
- [ ] Worker processes the job automatically (in dev mode)
- [ ] Job state transitions: PENDING → RETRYING → SUCCEEDED
- [ ] Invoice is created when job succeeds
- [ ] Audit logs are written with email preview URLs

## Architecture Notes

### UI → Backend Communication
- Wizard calls `POST /api/jobs` with payload containing:
  - `customers`: Array of email addresses
  - `type`: 'SEND_INVOICE'
  - `source`: 'csv' or 'qb'
  - `payload`: Delivery options
- Wizard polls `GET /api/jobs/:id` every 1 second to check progress
- Maximum 30 polls before timeout

### Worker Processing
- In development mode, the worker runs automatically every 5 seconds
- Worker picks up PENDING jobs and processes them
- Worker resolves email_sender resources from the database
- Worker sends emails via Nodemailer (Ethereal or real SMTP)
- Worker writes audit logs with preview URLs (Ethereal only)
- Worker updates job state and progress

### Mock Database
- Uses in-memory storage (no Postgres required)
- Resets on server restart
- Safe for development and testing
- To persist resources between UI tests, set CLEANUP=false in test-email-flow.js

## Troubleshooting

### Problem: Modal doesn't open
- Check browser console for JavaScript errors
- Ensure the wizard iframe path is correct (`./index.html`)

### Problem: Job creation fails (400 error)
- Check that the wizard state includes a valid `customers` array
- Verify the payload structure matches the API schema

### Problem: Job stays in PENDING state
- Ensure the worker loop is running (should see "Dev worker loop started" in server logs)
- Check server logs for worker processing messages
- Verify USE_MOCK_DB=true is set

### Problem: Job fails with "Bad sender address syntax"
- An email_sender resource exists but has an invalid FROM address
- Reset the mock DB by restarting the server
- Or seed a new Ethereal resource with a valid FROM address

### Problem: No preview URL in audit logs
- Ensure USE_ETHEREAL=true when creating the resource
- Ethereal preview URLs are only available when using nodemailer.createTestAccount()
- Check that the resource config includes `ethereal: true`

## Next Steps

1. **Add CSV parsing**: Parse uploaded CSV files and extract customer emails
2. **Improve error messages**: Show user-friendly error messages in the wizard
3. **Add job history**: Show a list of past jobs on the Canvas page
4. **Real-time updates**: Use WebSockets or SSE for live job progress updates
5. **Add tests**: Write automated UI tests using Playwright or Cypress

## Related Documentation

- [TESTING.md](./TESTING.md) - Backend E2E testing with mock DB
- [test-email-flow.md](./test-email-flow.md) - CLI test script usage
- [mysql-testing.md](./mysql-testing.md) - Optional MySQL local testing
- [Phase 1A Wizard Spec](../design/phase1a-wizard.md) - Original UX specification
