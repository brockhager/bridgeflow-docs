# BridgeFlow Core Terminology

To ensure clarity across engineering, product, and customer teams, we use precise, multi-word terms for key concepts.

> **Glossary Sync Protocol:** When adding/refining terms here, also update `.github/copilot-instructions.md`. When updating copilot instructions, reflect changes here. This two-way sync ensures AI agents and human developers use the same language.

## Approved Terms

### Integration Package
A complete, activated integration consisting of a trading partner, connector(s), adapter(s), and security/monitoring configuration.
*   **Context**: Replaces ambiguous term "package".
*   **Prisma Model**: `Package` (internal only).
*   **User-facing**: Always **"Integration Package"**.

### Data Payload
The actual business document exchanged over an integration package (e.g., X12 850, EDIFACT ORDERS, JSON invoice).
*   **Context**: Replaces "message", "document", "data package".

### Integration Blueprint
A reusable, versioned template that defines the structure of an integration package (required components, workflow, validation rules).
*   **Prisma Model**: `BridgeBlueprint`.

### Integration Bridge
The live, monitored instance of an integration package in operation.
*   **Context**: What users "activate" in the Canvas UI.

### Deploy Integration
The action of creating and activating an integration package from a blueprint.
*   **Context**: Replaces "activate bridge", "save bridge".

## Component Relationships

Understanding how these components fit together:

### Connector
**Role:** Transport layer — moves data in/out  
**Examples:** AS2, SFTP, HTTP Webhook  
**Function:** Handles network protocols, authentication, and data transmission

### Adapter
**Role:** Transformation layer — converts data formats  
**Examples:** X12 850 → JSON, CSV → XML, EDIFACT → Database  
**Function:** Parses, validates, and transforms Data Payloads between formats

### Workflow Pattern
```
[Inbound Connector] → [Adapter] → [Business Logic] → [Adapter] → [Outbound Connector]
```

**Example:** Receive X12 850 via AS2 → Parse to JSON → Validate → Transform to CSV → Send via SFTP

## Roles & Permissions

> **Note**: Avoid using the ambiguous term "admin" in isolation. Always specify the scope.

### `admin-bf` (BridgeFlow Admin)
*   **Definition**: An internal employee of BridgeFlow with super-admin privileges.
*   **Responsibilities**: Platform maintenance, global support, managing Public Blueprints, and overseeing all organizations.

### `customer_admin` (Organization Admin)
*   **Definition**: An administrator belonging to a specific customer Organization (Tenant).
*   **Responsibilities**: Managing their own organization's users, creating Private Blueprints, and configuring their specific integrations.

## Terms to Avoid
*   ❌ "package" (alone) — always say "Integration Package"
*   ❌ "bridge" (alone) — specify "Integration Bridge" or "Integration Blueprint"
*   ❌ "message" or "event" — use "Data Payload"
*   ❌ "document" (ambiguous — use "Data Payload" or specify format like "X12 850 document")
*   ❌ "admin" (use `admin-bf` or `customer_admin`)
*   ❌ "instance" or "deployment" (use "Integration Package")

## Agent4 Glossary Enforcement Checklist
As backend guardian, you must:
- ✅ Use glossary terms in API responses: `payload_id` (not `message_id`)
- ✅ Use glossary terms in log messages: "Integration Package provisioned" (not "instance deployed")
- ✅ Use glossary terms in error messages: "Data Payload validation failed" (not "message invalid")
- ✅ Flag glossary violations in code reviews: "Per glossary, use 'Integration Package', not 'instance'"
- ✅ Update glossary when new domain concepts emerge (e.g., "Event Trigger" in future phases)
- ✅ Sync changes with `.github/copilot-instructions.md`

## Integration with Development
- **Copilot Instructions:** [.github/copilot-instructions.md](../../.github/copilot-instructions.md)
- **Contributing Guide:** [CONTRIBUTING.md](../../CONTRIBUTING.md)
- **Onboarding Docs:** Point all new agents/developers to this glossary first
