# Platform: Core Services and Modules

The Platform section documents the underlying services that power Bridgeflow products.

These repos are not positioned as standalone customer products, but they are critical runtime components.

## Workspace Inventory (`c:\bridgeflow-core`)

| Repo | Category | Role | Status | Primary Endpoint |
|---|---|---|---|---|
| `bf-control` | Product Runtime | Control Tower runtime and policy engine | Live | `https://control-tower.up.railway.app/` |
| `bf-carrier-portal` | Product App | Carrier-facing UI | Development | Not yet documented |
| `bf-tracking-portal` | Product App | Shipment tracking UI | Development | Not yet documented |
| `bf-admin-console` | Platform Module | Internal admin and proxy UI/API | Active | `https://bf-admin.up.railway.app` |
| `bf-identity` | Platform Service | Auth, RBAC, token issuance | Active | `https://bf-identity.up.railway.app` |
| `bf-masterdata` | Platform Service | Locations/carriers reference data | Active | Service endpoint not yet documented |
| `bf-orders` | Platform Service | Order lifecycle management | Active | Service endpoint not yet documented |
| `bf-shipments` | Platform Service | Shipment state and tracking APIs | Active | `https://bf-shipments.up.railway.app` |
| `bf-search` | Platform Service | Search and ingestion index layer | Development | Service endpoint not yet documented |
| `bf-fintech` | Platform Service | Invoicing and payment workflows | Development | Service endpoint not yet documented |
| `bf-warehouse` | Platform Service | Inventory and pick task flows | Development | Service endpoint not yet documented |

## BF Umbrella Companion Apps

| App | Role | Status | Primary Endpoint |
|---|---|---|---|
| `coordsapp` | Spatial identity and coordination companion app (spec/core/cloud) | Active Development | `https://coords.up.railway.app` (from local docs) |

## Service Pages

- Admin Console: `bf-admin-console/`
- Identity: `bf-identity/`
- Masterdata: `bf-masterdata/`
- Orders: `bf-orders/`
- Shipments: `bf-shipments/`
- Search: `bf-search/`
- Fintech: `bf-fintech/`
- Warehouse: `bf-warehouse/`
