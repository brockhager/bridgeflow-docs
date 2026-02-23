# Job Orchestrator — Design (Phase 1A)

Purpose
-------
Design notes and acceptance criteria for the Job Orchestrator core (T-003).

Overview
--------
The Job Orchestrator is a thin platform core that receives invoice delivery requests from the UI, persists job metadata and items, and advances job state through a short life-cycle (Import -> Prepare -> Send -> Complete). For Phase 1A we'll implement a durable DB model (Prisma), a minimal REST API (POST /jobs, GET /jobs/:id, GET /jobs/:id/invoice), and an in-process simulated worker to progress jobs and report percent-complete for the UI.

Prisma Models (proposal)
------------------------
Add the following models to `prisma/schema.prisma`:

- enum JobStatus { PENDING IMPORTING PREPARING SENDING COMPLETED FAILED }

- model DeliveryJob {
  id        String    @id @default(cuid())
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  status    JobStatus @default(PENDING)
  source    String    // e.g., csv upload metadata
  customerCount Int
  totalItems Int
  progress  Int      @default(0) // 0..100
  // relationship
  items     DeliveryJobItem[]
}

- model DeliveryJobItem {
  id       String   @id @default(cuid())
  jobId    String
  job      DeliveryJob @relation(fields: [jobId], references: [id])
  recipient String
  status   JobStatus @default(PENDING)
  // additional fields: attempts, lastError, metadata
}

API Surface
-----------
POST /jobs
- Request:
  {
    "source": "csv-upload",
    "sourceMeta": { ... },
    "customers": ["customer-id-1", ...],
    "delivery": { "method": "email", "encrypted": true },
    "simulateFailure": false
  }
- Response (201):
  {
    "id": "cjx...",
    "status": "PENDING",
    "createdAt": "..."
  }

GET /jobs/:id
- Response (200):
  {
    "id": "cjx...",
    "status": "SENDING",
    "progress": 42,
    "customerCount": 10,
    "totalItems": 10,
    "createdAt": "...",
    "items": [ { "id": "...", "recipient": "...", "status": "SENDING" }, ... ]
  }

GET /jobs/:id/invoice
- Response (200): returns an invoice PDF or redirect to storage URL. For Phase 1A we will return a mock HTML invoice page (`web/invoice.html`) or a small PDF binary placeholder.

Acceptance Criteria
-------------------
- The DB schema compiles and migrates cleanly (prisma migrate).
- POST /jobs persists a DeliveryJob with initial items derived from request and returns a job id.
- A simulated worker advances status from Import -> Prepare -> Send -> Complete and updates `progress` field so the UI shows percent.
- GET /jobs/:id returns the job status and progress.
- On completion, GET /jobs/:id/invoice returns an access point (mock or real) the UI can open.
- Tests cover the core happy path and simulated failure path.

Next steps (immediate)
----------------------
1. Add Prisma models and create a migration (blocked until we run migrations in a dev DB in CI/local).  
2. Implement minimal ESM Node API (Fastify recommended) and endpoints above.  
3. Implement simulated in-process worker and progress reporting.  

Notes
-----
- Keep design minimal and testable for Phase 1A; focus on durability and clear contracts to let the UI integrate with polling.
- Use `progress` (0..100) to communicate percent-complete. Store job items so we can later implement retries and per-item status.
