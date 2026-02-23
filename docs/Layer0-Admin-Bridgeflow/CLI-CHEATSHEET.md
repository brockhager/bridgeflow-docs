# Admin CLI / API Cheatsheet

Quick curl examples and small snippets for commonly used admin operations. Replace `ADMIN_TOKEN` and `ORG_ID` appropriately.

## 1) Impersonate a customer (Login As)
POST /admin-api/tenants/:organizationId/impersonate

curl -X POST "http://localhost:3000/admin-api/tenants/ORG_ID/impersonate" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'

Response: { accessToken: "...", user: {...} }

## 2) Suspend an organization
POST /admin-api/tenants/:organizationId/suspend

curl -X POST "http://localhost:3000/admin-api/tenants/ORG_ID/suspend" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason":"fraud", "notifyCustomer":true }'

## 3) Reactivate an organization
POST /admin-api/tenants/:organizationId/reactivate

curl -X POST "http://localhost:3000/admin-api/tenants/ORG_ID/reactivate" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"processBacklog":true, "notifyCustomer":true }'

## 4) Manual data correction
PATCH /admin-api/tenants/:organizationId/data

curl -X PATCH "http://localhost:3000/admin-api/tenants/ORG_ID/data" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"field":"name","value":"Acme Corp","reason":"typo fix"}'

## 5) Emergency controls
POST /admin-api/emergency/global-pause
POST /admin-api/emergency/global-resume
POST /admin-api/emergency/clear-cache { cacheType: metrics|redis|all }

curl -X POST "http://localhost:3000/admin-api/emergency/global-pause" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason":"maintenance"}'

## 6) Metrics endpoints
GET /admin-api/metrics/summary
GET /admin-api/metrics/volume?from=2025-12-25T00:00:00Z&to=2025-12-26T00:00:00Z

Note: Many admin endpoints are IP-whitelisted and require RBAC permissions (e.g., `admin:accounts:manage`, `admin:emergency`). Use the admin test stubs for local demos.
