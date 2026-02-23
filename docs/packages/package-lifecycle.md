# Package Lifecycle

Every package ingested into BridgeFlow goes through a defined lifecycle managed by the Package Service and Temporal Workflows.

## Status Transitions

1.  **`RECEIVED`**
    - Initial state upon successful POST to `/api/packages`.
    - Payload is validated for basic size and format constraints.
    - Persisted to database with `payload` and `metadata`.

2.  **`PARSING`**
    - The processing workflow has picked up the package.
    - Parser (X12, Edifact, or JSON) is attempting to extract structured data.

3.  **`PROCESSED`**
    - **EDI**: Content valid, transaction extracted, and routed to the appropriate bridge/handler.
    - **Bridge Config**: Validation passed, and provisioning workflow trigger (or completed).
  
4.  **`ACK_GENERATED` (EDI Only)**
    - For X12/EDIFACT, a 997/CONTRL acknowledgment has been generated and queued for the sender.

5.  **`FAILED`**
    - Parsing error, validation failure, or system error.
    - `errorDetails` field in the database contains specific diagnostic info.

## Temporal Integration

The Package Service emits signals to Temporal workflows to drive these transitions asynchronously, ensuring high throughput and resilience.
