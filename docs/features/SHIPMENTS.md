# SHIPMENTS

`bf-shipments` is the operational TMS service for shipment lifecycle, dispatch, tracking, and customer visibility.

## Shipment Lifecycle

- Create and manage shipments across draft, planned, in-transit, delivered, and exception states.
- Track pickup and delivery milestones with timeline/event history.
- Support status updates and quick transitions from dispatcher workflows.

## Dispatch Operations

- Dispatch board with map and timeline views.
- Driver/truck assignment and reassignment flows.
- Policy preflight checks before reassignment (violations and warnings).
- Suggestion/fix-it panel support for policy-compliant alternatives.

## Live Telemetry and Map Visibility

- Truck telemetry ingestion fields for position, heading, speed, and freshness timestamps.
- Live telemetry API for dispatch clients.
- Smooth map marker interpolation and heading-aware truck rendering.
- Signal-loss handling using telemetry age thresholds.

## Location and Geofence Workflows

- On-the-fly location creation from shipment planning UX.
- Optional Coords geofence push when creating locations.
- Graceful fallback when external geofence push fails.

## Integrations and Admin Controls

- Coords integration settings persistence (tenant/key and sync behaviors).
- Asset/location sync and geofence push orchestration.
- Sync status tracking and audit visibility via admin endpoints.

## Customer and Public Experience

- Public shipment tracking page support.
- Customer dashboard and order/shipment detail views.
- Notification-friendly tracking link patterns.

## Sandbox and Demo Data

- Built-in demo seeding for organizations, users, shipments, and events.
- CLI and startup-trigger options for environment setup.
