# Abstraction Interfaces (TypeScript) — Draft

Purpose: Provide clear, testable interfaces that enable evolving the tenancy model and swapping implementations (e.g., secrets backends, audit sink) without major code rewrites.

All interfaces are intentionally minimal and focused on contracts. Implementations must instrument observability and enforce RBAC.

---

## Common types
```ts
export type Result<T> = { ok: true; value: T } | { ok: false; error: Error; code?: string };

export interface Paging { limit?: number; offset?: number; cursor?: string }

export interface Principal { id: string; roles: string[]; email?: string }

export interface TraceContext { traceId?: string; spanId?: string }
```

## RequestContext
```ts
export interface RequestContext {
  requestId: string; // correlation id
  principal?: Principal;
  tenantId?: string; // resolved tenant id for request
  tenant?: TenantDescriptor; // resolved descriptor when available
  trace?: TraceContext;
  authMethod?: 'api_key' | 'oauth2' | 'mtls' | 'none';
  hasRole(role: string): boolean;
}
```

## TenantDescriptor & Manager
```ts
export type TenantIsolationMode = 'shared-schema' | 'schema-per-tenant' | 'db-per-tenant'

export interface TenantDescriptor {
  id: string;
  name?: string;
  isolation: TenantIsolationMode;
  region?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface ITenantManager {
  resolveTenant(ctx: RequestContext): Promise<Result<TenantDescriptor | null>>;
  getTenant(tenantId: string): Promise<Result<TenantDescriptor | null>>;
  listTenants(filter?: any): Promise<Result<TenantDescriptor[]>>;
  createTenant(input: { name: string; isolation?: TenantIsolationMode; metadata?: Record<string, any> }): Promise<Result<TenantDescriptor>>;
  setIsolation(tenantId: string, isolation: TenantIsolationMode): Promise<Result<void>>;
  getConnectionInfo(tenant: TenantDescriptor): Promise<Result<ConnectionInfo>>;
}

export interface ConnectionInfo { connectionString: string; schema?: string }
```

## TenantDataAccess (The critical abstraction)
- Purpose: Abstracts data access such that code using tenant-scoped data does not need to know whether we run shared-schema, schema-per-tenant, or db-per-tenant.

```ts
export interface TenantDataAccess<T, ID = string> {
  findById(ctx: RequestContext, id: ID): Promise<Result<T | null>>;
  findAll(ctx: RequestContext, filters?: Record<string, any>, paging?: Paging): Promise<Result<T[]>>;
  create(ctx: RequestContext, entity: Partial<T>): Promise<Result<T>>;
  update(ctx: RequestContext, id: ID, patch: Partial<T>): Promise<Result<T>>;
  delete(ctx: RequestContext, id: ID): Promise<Result<void>>;
  transaction<R>(ctx: RequestContext, callback: (tx: TransactionScope) => Promise<Result<R>>): Promise<Result<R>>;
}

// Implementations:
//  - SharedSchemaTenantDataAccess (adds tenant filters automatically)
//  - SchemaPerTenantDataAccess (resolves schema and uses schema-scoped connections)
//  - DbPerTenantDataAccess (resolves tenant-specific connection strings)
```

## Secrets Manager (ISecretsManager)
- Purpose: Abstract access to secrets. Production impls use KMS + Secrets Manager, dev can use file-based or env-based shim.

```ts
export interface SecretMetadata { createdAt: string; version?: string }

export interface ISecretsManager {
  getSecret<T = string>(ctx: RequestContext, path: string): Promise<Result<T>>;
  listSecrets(ctx: RequestContext, prefix: string): Promise<Result<Record<string, string>>>;
  putSecret?(ctx: RequestContext, path: string, value: string): Promise<Result<void>>;
  getMetadata?(ctx: RequestContext, path: string): Promise<Result<SecretMetadata | null>>;
}
```

Requirements:
- Calls must be audited
- Cached with short TTL locally
- Support for rotation and version metadata

## Audit Logger
- Purpose: Immutable, append-only logging for compliance with retention and queryability

```ts
export type AuditEventType = 'TENANT_CREATED' | 'TENANT_UPDATED' | 'USER_LOGIN' | 'CONFIG_CHANGE' | string;

export interface AuditEvent {
  id: string; // UUID
  occurredAt: string;
  tenantId?: string;
  principalId?: string;
  type: AuditEventType;
  payload: any; // structured JSON
}

export interface IAuditLogger {
  record(ctx: RequestContext, event: AuditEvent): Promise<Result<void>>;
  // Optional: query/stream for operator tools (not used for write path to keep write fast)
  listEvents?(filter: { tenantId?: string; type?: string; from?: string; to?: string }): Promise<Result<AuditEvent[]>>;
}
```

Requirements:
- Write path should be highly available and append-only
- Event immutability guaranteed by service (write-once semantics)
- Retention policy enforced by the `audit-service` (e.g., move older logs to cold encrypted storage after 90 days)

## ServiceDiscovery
- Purpose: Simple, lightweight discovery for services in the microservice architecture without forcing heavy orchestration

```ts
export interface IServiceInfo { name: string; baseUrl: string; metadata?: Record<string, any> }

export interface IServiceDiscovery {
  getService(name: string): Promise<Result<IServiceInfo | null>>;
  listServices(): Promise<Result<IServiceInfo[]>>;
  registerService?(info: IServiceInfo): Promise<Result<void>>; // optional for simple setups
}
```

---

## Example usage patterns
- Business logic should accept a `TenantDataAccess<T>` (constructor injection) and `RequestContext` on each request
- Tests can provide an in-memory `TenantDataAccess` or mock to assert tenant filtering
- Secrets retrieval is via `ISecretsManager.getSecret(ctx, path)` — never read raw envs for production creds

---

## Notes & Next Steps
- These interfaces are intentionally small; refine with the team and implement small dev shims for local usage
- Add TypeScript `index.d.ts` and example implementations in `@bridgeflow/lib-db` and `@bridgeflow/lib-secrets`
- Enforce strict TS configuration: no `any` in security-critical modules
