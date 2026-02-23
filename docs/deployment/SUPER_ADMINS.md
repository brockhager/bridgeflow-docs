# Super Admin Configuration

## Overview

Super admins bypass organization membership requirements and can perform global administrative tasks (e.g., creating public blueprints, system configuration).

## Configuration

Set the `SUPER_ADMINS` environment variable with a comma-separated list of email addresses:

```bash
# Single super admin
SUPER_ADMINS=cto@bridgeflow.test

# Multiple super admins
SUPER_ADMINS=cto@bridgeflow.test,admin@company.com,ops@bridgeflow.io
```

## Capabilities

Super admins can:

- ✅ Create global blueprints (organizationId: null)
- ✅ Access system-level APIs without org membership
- ✅ Bypass RBAC permission checks (when ENFORCE_RBAC is off)
- ✅ Manage organizations they're not members of (with proper permissions)

## Security

- **Email-based**: Super admin status is determined by email match against `SUPER_ADMINS` list
- **Case-insensitive**: Email matching is case-insensitive
- **Environment-only**: Cannot be set via API or UI; must be configured in environment
- **No database**: Super admin list is not stored in the database

## JWT Token

Super admins receive a JWT token with:

```json
{
  "userId": "...",
  "email": "cto@bridgeflow.test",
  "isSuperAdmin": true,
  "isBfEmployee": true,
  "role": "bf_employee"
}
```

## Legacy Compatibility

The `BRIDGEFLOW_OPERATOR_EMAILS` environment variable has been removed. Use `SUPER_ADMINS` for all deployments.

## Testing

Use the integration test to verify super admin functionality:

```bash
pnpm run test -- test/integration/super-admin.test.js
```

## Deployment Examples

### Docker Compose

```yaml
services:
  api:
    environment:
      - SUPER_ADMINS=cto@bridgeflow.test,admin@company.com
```

### Kubernetes

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: bridgeflow-config
data:
  SUPER_ADMINS: "cto@bridgeflow.test,admin@company.com"
```

### Railway

Set environment variable in Railway dashboard:

```
SUPER_ADMINS=cto@bridgeflow.test
```

## Best Practices

1. **Limit access**: Only assign super admin to trusted personnel
2. **Use work emails**: Prefer organizational email addresses over personal
3. **Audit regularly**: Review super admin list quarterly
4. **Separate from dev**: Don't use super admin in development (use BRIDGEFLOW_DEV_ADMIN instead)
5. **Document**: Maintain a list of super admins in your internal documentation

## Related

- [Authentication](../auth/README.md)
- [RBAC](../rbac/README.md)
- [Development Mode](../development.md)
