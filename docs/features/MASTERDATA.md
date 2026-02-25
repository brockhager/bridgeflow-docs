# MASTERDATA

`bf-masterdata` is the canonical service for reference entities consumed across domain apps.

## Reference Entity APIs

- Location retrieval by internal ID.
- Location retrieval by external cross-reference (`w3s` ID).
- Carrier retrieval by internal ID.

## Data Bootstrapping

- Startup seed behavior when database is empty.
- Shared source-of-truth patterns for location/carrier lookups.

## Service Reliability

- Health endpoint for dependency checks.
- Persistent relational model for stable IDs and xref mappings.
