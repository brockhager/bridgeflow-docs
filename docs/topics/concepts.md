# Core Concepts

This page explains Bridgeflow without implementation detail.

## Events

Events are normalized operational signals from external systems (ERP, WMS, TMS, carriers, sensors).

Examples:
- `shipment.created`
- `shipment.delayed`
- `shipment.delivered`

Every event includes:
- who it belongs to (`tenant_id`)
- what happened (`event_type`)
- when it happened (`occurred_at`)
- business context (`payload`)

## Policies

Policies convert raw events into decisions.

Examples:
- If delay exceeds 4 hours, trigger an exception.
- If weather risk is high, elevate case priority.

Policy output typically updates risk state and may trigger downstream actions.

## Cases

Cases are actionable exception records created when policies indicate intervention is needed.

A case captures:
- the triggering condition
- severity and SLA target
- ownership and lifecycle status

In the live Control Tower, cases are created autonomously when configured policy thresholds are crossed.

## How They Work Together

1. Event arrives from a connected system.
2. Policy engine evaluates event + context.
3. Risk score/state updates.
4. Case is created or updated when action is required.

Result: teams do not need to manually monitor every signal. Bridgeflow surfaces and prioritizes what needs attention.

## Related References

- Architecture:
`../ARCHITECTURE/`
- Current system overview:
`../current/control-tower/`
- Public API:
`../current/control-tower/public-api/`
