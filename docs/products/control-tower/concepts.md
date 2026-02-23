# Control Tower Concepts

This page explains the operational model used by the Control Tower.

## Events

Events are normalized signals from external systems.

Examples:
- `shipment.created`
- `shipment.delayed`
- `shipment.delivered`

Required envelope fields:
- `event_id`
- `tenant_id`
- `event_type`
- `source`
- `occurred_at`
- `payload`

## Policies

Policies evaluate events against business rules.

Examples:
- Delay exceeds threshold -> escalate.
- Risk condition detected -> increase severity.

## Cases

Cases are actionable exception records created by policy outcomes.

Each case carries:
- reason/context
- severity/risk
- SLA target
- lifecycle status

## Runtime Flow

1. Event ingested.
2. Policy evaluated.
3. Risk updated.
4. Case created or updated.

This is the live chain validated in the Lima pilot.
