# Layer 1 — Business Layer

## Overview
Layer 1 (Business Layer) implements the platform's core business logic, domain rules, and API surface. It serves as the orchestrator for BridgeFlow, enforcing permissions, managing data models, and coordinating interactions between the frontend Canvas and the backend processing engines.

## Key Responsibilities

1.  **API Surface & Routing**
    -   Exposes REST endpoints (`/api/*` and `/admin-api/*`) for web clients and CLI tools.
    -   Handles request validation, authentication (JWT), and rate limiting.

2.  **Domain Logic & Orchestration**
    -   **Blueprints**: Manages the catalog of integration patterns (Public vs. Private scoping).
    -   **Packages**: Ingestion point for all data (EDI files, JSON, Bridge Configs).
    -   **Trading Partners**: CRUD operations for partner management and configuration.

3.  **Security & RBAC**
    -   Enforces tenant isolation using `organizationId`.
    -   Applies role-based access control (e.g., restricting Private Blueprints to Enterprise admins).

4.  **Worker Coordination**
    -   Enqueues tasks for Layer 4+ workers (e.g., parsing, transformation).
    -   Tracks job status and reports progress via the API.

## Core Components

-   **Blueprints Engine** (`api/services/BlueprintService.js`)
    -   Manages `BridgeBlueprint` entities.
    -   Enforces public/private visibility rules.
    
-   **Package Service** (`api/services/PackageService.js`)
    -   Central ingress for all payloads.
    -   Validates and routes data to the appropriate processing workflow.

-   **Data Models** (`prisma/schema.prisma`)
    -   Defines the schema for Users, Organizations, Blueprints, Bridges, and Packages.

## Relationship to Other Layers

-   **Layer 0 (Admin)**: Consumes Layer 1 APIs for platform-wide management.
-   **Layer 2 (Connection)**: Layer 1 orchestrates connections but delegates actual protocol handling to Layer 2 adapters.
-   **Layer 5 (Infrastructure)**: Layer 1 runs on top of the container orchestration provided by Layer 5.

## Recent Updates (Phase 32)
-   **Blueprint Catalog**: Added endpoints for dynamic blueprint fetching and filtering.
-   **Bridge Activation**: Added `BRIDGE_CONFIG` package type to support instant provisioning from the Canvas UI.

## Phase 39 Update — Global Blueprints & Super Admin
- **Global Blueprints:** Phase 39 enables creation of system-level (global) blueprints where `organizationId` is `null` — intended for platform-provided templates and CTO/ops workflows.
- **Super-Admin Bypass:** Super-admins (configured via `SUPER_ADMINS`) can create and manage these global blueprints; services should treat `organizationId: null` as system-scoped. For details see `docs/phases/phases31-40/PHASE-39-COMPLETE-SUMMARY.md` and `api/handlers/auth.js`.


## Developer Guide
-   **Run Tests**: `npm test` (Uses in-memory DB mocks for speed).
-   **Add Endpoint**: Create handler in `api/routes/`, register in `api/server.js`, and add integration test.
