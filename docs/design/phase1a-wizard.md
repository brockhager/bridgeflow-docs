# Phase 1A — 5‑Minute Wizard: "Send invoices automatically"

Goal: SMB owners set up automatic invoice delivery in 5 minutes or less without seeing a single technical term. The wizard is focused, friendly, and purpose-driven: "It just works." This doc contains the screen flow (max 5 screens), business copy, progress indicators, and plain-language error handling.

Overview
- Target user: SMB owner or office manager
- Promise: "Set up automatic invoices in under 5 minutes"
- Source systems for Phase 1A: QuickBooks CSV export (recommended) or QuickBooks read-only API (optional)
- Delivery method for Phase 1A: **Encrypted Email with PDF attachments** (recommended)

Why these choices (short)
- CSV export is fastest for a pilot and avoids needing a live integration for every customer.
- Encrypted email is universally supported by customers and simple for pilots — no partner setup required.

---

Screen 1 — Welcome & Start
- Title: "Send invoices automatically"
- Subtitle: "We’ll send your invoices for you — set it up in 5 minutes."
- Body: "Pick your invoice source and who should receive invoices. We’ll handle the rest."
- Primary CTA: **Start setup**
- Secondary: Help (small link)
- Microcopy: "Estimated time: 5 minutes. No technical details required."

Why this screen
- Sets expectation and reduces friction. One clear CTA to begin.

---

Screen 2 — How do you want to provide invoices?
- Title: "Where are your invoices today?"
- Options (card buttons):
  1. **Upload invoice CSV** (Recommended — fastest)
     - Copy: "Upload a QuickBooks CSV export and we’ll read it for you. We’ll show a preview so you can confirm."
  2. **Connect QuickBooks** (Convenient — one-click if you want automation)
     - Copy: "Connect QuickBooks to fetch invoices automatically. We only read invoices — no changes to your books."
- Small hint: "Don’t see QuickBooks? Upload a CSV and we’ll guide you."

Behavior & copy notes
- Default focus: **Upload CSV** to meet 5-minute goal.
- If user chooses Connect QuickBooks, show simplified success/failure copy (see Error Handling below).
- For CSV flow, accept typical QuickBooks invoice export formats and show a quick preview on next step.

---

Screen 3 — Who should we send invoices to?
- Title: "Which customers should receive invoices?"
- If QuickBooks connected: show a short list of customers loaded from QuickBooks with checkboxes (show first 10 + search).
- If CSV upload: show auto-detected customer list from the uploaded file and a 3-row preview table.
- Options: 
  - **All customers** (default)
  - **Select customers** (open multi-select list)
- Copy: "Choose the customers who should receive automated invoices now. You can change this anytime."

Microcopy for mapping problems
- If customer names are ambiguous: "We found multiple entries for ‘Acme’. Please confirm which one(s) to send to."

---

Screen 4 — How should we deliver the invoice?
- Title: "How should we send invoices?"
- Options (radio buttons):
  1. **Encrypted email with PDF (recommended)**
     - Copy: "We’ll securely email invoices as PDF attachments to your customers. No setup required on their side."
  2. **Customer portal (optional)**
     - Copy: "We’ll put invoices in a secure download area that customers can use if you prefer not to email attachments."
  3. **Send to partner (optional)**
     - Copy: "If your partner can accept webhooks, we can forward invoices to their system (pilot only)."
- Default: **Encrypted email**
- Additional field (simple): "Notify me when the first invoice is sent" — toggle: **On** (default)
- Microcopy: "You can change this anytime from the Invoice Settings page."

Why encrypted email
- Works for nearly all customers, requires no partner setup, and supports pilot speed.

---

Screen 5 — Review & Start
- Title: "Ready — we’ll take it from here"
- Summary block:
  - Source: "Uploaded CSV (file.csv)"
  - Customers: "All customers" or list of selected customers
  - Delivery: "Encrypted email with PDF"
  - Start: "Now" or scheduled time (optional; default Now)
- CTA: **Start sending invoices** (primary)
- Secondary: **Save & finish later**

On-click behavior: show a single-line progress modal with friendly stepper:
- Header: "Setting things up — this usually takes less than a minute"
- Stepper (3 steps):
  1. **Importing invoices** — "We’re reading your invoices and preparing them." (shows counts under it)
  2. **Preparing files** — "Generating PDF copies and secure delivery packages." (shows progress spinner)
  3. **Sending test invoice** — "We send a test to confirm delivery and report back." (shows status)
- Progress UI: stepper with checkmarks + short text for current step; overall progress bar for long-running tasks

Success & confirmation
- After steps complete, show screen: "Success — First invoice sent to ACME Corp"
- Provide CTA: **View status** (takes to job progress page) and **Done** (closes wizard)
- Send an in-app and email notification: "Your automatic invoices are active and the first invoice was delivered to Acme Corp."

---

Error handling (business-language only)
- File upload problems
  - If CSV cannot be read: "We couldn’t read this file. Please try exporting again from QuickBooks and upload the new file or choose ‘Connect QuickBooks’." Buttons: **Re-upload**, **Connect QuickBooks**, **Help**
  - If required columns missing: "It looks like your file is missing some information we need (customer, amount, date). We can try to map columns for you — would you like us to map them?" Buttons: **Auto-map**, **I’ll fix the file**
- QuickBooks connect failure
  - "We couldn’t connect to QuickBooks right now. You can try again, or upload your CSV to continue. If this continues, click Help to see step-by-step instructions." Buttons: **Try again**, **Upload CSV**, **Help**
- Delivery failure (first test send)
  - If the test invoice fails to deliver: "We tried to deliver a test invoice and it did not reach the recipient. We’ll retry automatically and notify you. You can also update delivery settings or add an alternate contact." Buttons: **Retry now**, **Change delivery**, **Contact support**
- Unexpected problem
  - "Something went wrong on our side — we’ve logged the issue and our team will look into it. We’ll update you as soon as it’s fixed." CTA: **View status** or **Close**

All error messages are written in plain business language without technical jargon. Include a small ‘Help’ path that presents simple steps (e.g., how to export CSV from QuickBooks) and an option to contact support.

---

Progress indicators & ongoing status
- Short tasks: modal with 3-step stepper and checkmarks
- Longer background jobs (e.g., large backfills): show a job status page with timeline and progress, and send an email when complete
- Real-time updates: use web notifications or polling — keep messages short and business oriented

---

What the user sees after setup
- A short confirmation message and a first delivery notification
- A simple recurring status card in the Dashboard: "Invoices are being sent automatically — last invoice sent to Acme Corp at 10:12 AM"
- Controls: **Pause sending**, **Stop**, **Change customers**, **Change delivery method** — all business language

---

Admin controls (hidden; for operators)
- UI for internal operators to see job logs, retry failed deliveries, and run manual test sends
- Operators have a clear audit trail for changes (who changed what and when)

---

Time estimates & flow rationale
- Happy path (CSV upload + default settings): under 5 minutes from Start to first test send
- QuickBooks connect path: may take longer depending on OAuth steps (still attempt to keep <5 minutes for common cases)

---

Next UX follow-ups (Phase 1B-ready hooks)
- Add an optional enhanced mapping screen if CSVs vary a lot (but make it behind a "Need help mapping?" link)
- Add a one-click "Resend to these customers" and a history view for delivered invoices
- Add telemetry hooks to track step conversion times and drop-off points

---

Deliverable: This file serves as the canonical UX spec for the Phase 1A 5-minute wizard. After review, I will prepare a simple wireframe (PNG or Mermaid diagram) and the auto-configuration doc describing default behaviors and fallback strategies.
