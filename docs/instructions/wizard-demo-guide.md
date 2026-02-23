## Phase 1A Wizard — Demo Guide

Purpose
-------
This is the Phase 1A "Magic Toll Booth" wizard for invoice delivery. The demo demonstrates the 5‑minute setup flow (Welcome → Source → Customer → Delivery → Review) and shows the end-to-end happy path plus error recovery.

Status
------
APPROVED
Approved by CTO: 2025-12-15

How to run (quick)
-------------------
Run a simple static server from the project root and open the prototype in a browser:

```bash
npx http-server web -p 3000
# then open http://localhost:3000 in your browser
```

Demo script (step-by-step)
--------------------------
1. Start on the **Welcome** screen. Click **Start setup**.
2. On **Source**, select **Upload invoice CSV** (default). Note keyboard navigation: use Tab to move focus and Enter to select cards.
3. On **Customer**, observe the auto-detected customer list in the CSV preview. Default: **All customers**. Select **All customers**.
4. On **Delivery**, leave defaults (Encrypted email) and keep **Notify me** as-is. Click **Next**.
5. On **Review**, confirm the summary shows Source, Customers, and Delivery. To demo error recovery, check **Simulate failure (demo)** and click **Start sending invoices**.
6. Observe the **progress stepper** modal; it will fail (simulated). Click **Retry** (uncheck Simulate failure first) to run again and observe a successful completion.
7. On success, the modal shows a fake job ID and the Success screen: **Success — First invoice sent**. Click **View status** or **Done**.

Key features to highlight (business-language)
-------------------------------------------
- **5-minute promise**: wizard delivers a focused path to get invoice automation running quickly.
- **Friendly progress visibility**: stepper shows clear progress across Import → Prepare → Send → Complete.
- **Error recovery**: demo shows automatic retries and a clear path to retry or change settings without losing state.
- **Accessibility & keyboard support**: full keyboard navigation (Tab/Enter/Escape) and accessible stepper messaging.

Screenshot
----------
Please include a screenshot of the Review screen in this guide. Save the image as `docs/images/wizard-review.png` and include it next to this file.

If you want, paste the screenshot or a link here and I will embed it into the guide and commit it.

Notes for demo presenter
------------------------
- Keep the demo fast: follow the happy path first, then exercise the error scenario.
- Mention the mock job ID is a demo artifact; after UI sign-off we will integrate with the backend job orchestrator to return real job IDs and statuses.

Decision
--------
Decision: "Yes, approved" — Approved by CTO
Date: 2025-12-15

CTO Review conducted on 2025-12-15. Feedback: "Demo was good. Design could be better - but overall it works and makes sense." The requested visual polish, live progress percentage, and invoice access were implemented and approved.

CTO requested changes (2025-12-15):
1. Improve visual design to make the app feel like a demo product (the plain white background is too plain).
2. Add live percentage progress during the sending step (e.g., "10% complete...").
3. Provide an access point to the sent invoice after the job completes (e.g., a link to view/download the invoice PDF).

Update (2025-12-15): The requested changes have been implemented:
- Live percentage progress during the Sending step in the job modal.
- "View Sent Invoice" button on success that opens a mock invoice page.
- Visual polish applied (subtle gradient, refined spacing, brand color accents).

Please review the updated demo and reply with either "Yes, approved" or "No, make these changes: ...".

Formal Approval
---------------
CTO approval granted on 2025-12-15. 'I approve the demo.'

Appendix: Run locally (optional)
--------------------------------
- Start a local static server: `npx http-server web -p 3000`.
- Open `http://localhost:3000` and walk through the wizard.

---

Prepared by: Agent4
Date: 2025-12-15
