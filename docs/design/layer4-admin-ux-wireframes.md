# Layer 4 — Admin UX Wireframes (Security/RBAC/Audit)

Status: Draft

This is a minimal, implementation-agnostic sketch of the **admin experiences** needed to support the Layer 4 security foundation.

Note: “Layer 4 / Platform Core” is used only as the end-state architecture location for these capabilities.

Scope:
- Tenant-scoped admin (Tenant Admin)
- Operator/admin (Platform role)

---

## 1) Tenant Admin: Users

Page: `Settings → Users`

Layout:
```
Users
---------------------------------------------------------
[ Invite User ]

Email                Name        Role            Status
---------------------------------------------------------
alice@acme.com       Alice       Tenant Admin    Active
bob@acme.com         Bob         Developer       Active
carol@acme.com       Carol       Viewer          Invited
---------------------------------------------------------
```

Actions:
- Invite user (email + role)
- Change role (Admin only)
- Remove user (Admin only)

Audit requirements:
- `user.invite`, `user.role_changed`, `user.removed`

---

## 2) Tenant Admin: API Keys

Page: `Settings → API Keys`

Layout:
```
API Keys
---------------------------------------------------------
[ Create API Key ]

Name            Created        Last Used        Actions
---------------------------------------------------------
Automation      2025-12-xx     2025-12-xx       Revoke
---------------------------------------------------------
```

Rules:
- Only show raw key material once (at creation).
- Revoke is irreversible.

Audit:
- `api_key.created`, `api_key.revoked`

---

## 3) Tenant Admin: Audit Log

Page: `Settings → Audit Log`

Layout:
```
Audit Log
---------------------------------------------------------
Time                Actor           Action            Target
---------------------------------------------------------
2025-12-xx 12:01    alice@acme.com  bridge.updated    Bridge "Inbound Orders"
2025-12-xx 12:10    system(worker)  delivery_attempt  Job cjx...
---------------------------------------------------------
```

Rules:
- Read-only.
- Tenant Admin and Tenant Auditor can access.

---

## 4) Resources (Operator-first, later tenant self-service)

Page: `Resources`

Layout:
```
Resources
---------------------------------------------------------
[ Create Resource ]

Name                 Type             Tenant   Validated
---------------------------------------------------------
Acme Webhook (Pilot)  webhook_endpoint Acme    Yes
Shared Email Sender   email_sender     Global  Yes
---------------------------------------------------------
```

Resource detail actions:
- Edit non-sensitive config
- Rotate secret (operator)
- Validate (test send)

Audit:
- `resource.created`, `resource.updated`, `resource.validated`
- `secret.accessed` (if validation requires secret read)

---

## 5) Operator: Tenant Support

Page: `Operator → Tenants`

Layout:
```
Tenants
---------------------------------------------------------
Tenant     Status    Users  Bridges  Resources  Actions
---------------------------------------------------------
Acme       Active    3      5        2          View
---------------------------------------------------------
```

Rules:
- Prefer “scoped support actions” over impersonation.
- If impersonation exists, it must be time-boxed and fully audited.
