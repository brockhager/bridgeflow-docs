# ORDERS

`bf-orders` manages order lifecycle records in the logistics chain.

## Order APIs

- Create new orders.
- List orders scoped to organization context.
- Retrieve order detail by ID.

## Domain Responsibilities

- Core order capture and state source for downstream shipment flows.
- Service boundary between commercial order intake and execution systems.

## Integration Surface

- Configurable masterdata service dependency.
- JWT/secret-based auth integration patterns.
