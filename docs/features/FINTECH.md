# FINTECH

`bf-fintech` is the freight audit and billing engine.

## Billing and Invoicing

- Generate invoices for completed shipments.
- Invoice model and routes for billing workflows.

## Event-Driven Outputs

- Emit `InvoiceCreated` events for downstream consumers.
- Background event processing support.

## Pricing and Integration Services

- Internal pricing service integration.
- External/masterdata lookups for required references.

## Quality Coverage

- End-to-end, payments, and webhook test suites in repository.
