# Bridge API Documentation

## Overview

The Bridge API provides endpoints for managing API integrations with external partners. Bridges enable both inbound (webhook receiving) and outbound (HTTP requests) communication.

**Base URL**: `https://your-domain.com` or `http://localhost:4000` (development)

## Bridge Resource

A Bridge represents a configured integration endpoint with the following properties:

```typescript
interface Bridge {
  id: string              // Unique identifier
  name: string            // Human-readable name
  type: string            // 'api' | 'edi' | 'database'
  direction: string       // 'inbound' | 'outbound' | 'both'

  // API Configuration
  url?: string            // Target URL for outbound requests
  method?: string         // 'GET' | 'POST' | 'PUT' | 'DELETE'
  authMethod?: string     // 'api_key' | 'oauth' | 'basic' | 'none'
  authConfig?: object     // Authentication configuration

  // Retry Configuration
  retryAttempts: number   // Number of retry attempts (default: 3)
  retryDelay: number      // Delay between retries in ms (default: 1000)
  timeout: number         // Request timeout in ms (default: 30000)

  status: string          // 'active' | 'inactive' | 'error'
  createdAt: string       // ISO 8601 timestamp
  updatedAt: string       // ISO 8601 timestamp
}
```

---

## Bridge Endpoints

### Create Bridge

Create a new bridge configuration.

**Endpoint**: `POST /api/bridges`

**Request Body**:
```json
{
  "name": "Partner API Integration",
  "type": "api",
  "direction": "outbound",
  "url": "https://partner.com/api/v1/orders",
  "method": "POST",
  "authMethod": "api_key",
  "authConfig": {
    "headerName": "X-API-Key",
    "apiKey": "your-api-key-here"
  },
  "retryAttempts": 3,
  "retryDelay": 1000,
  "timeout": 30000
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "bridge": {
    "id": "clxyz123abc",
    "name": "Partner API Integration",
    "type": "api",
    "direction": "outbound",
    "url": "https://partner.com/api/v1/orders",
    "method": "POST",
    "authMethod": "api_key",
    "authConfig": { "headerName": "X-API-Key", "apiKey": "***" },
    "retryAttempts": 3,
    "retryDelay": 1000,
    "timeout": 30000,
    "status": "active",
    "createdAt": "2025-12-17T05:30:00.000Z",
    "updatedAt": "2025-12-17T05:30:00.000Z"
  }
}
```

---

### List Bridges

Get all bridges with optional filtering.

**Endpoint**: `GET /api/bridges`

**Query Parameters**:
- `type` (optional): Filter by type ('api', 'edi', 'database')
- `status` (optional): Filter by status ('active', 'inactive', 'error')
- `direction` (optional): Filter by direction ('inbound', 'outbound', 'both')

**Response** (200 OK):
```json
{
  "success": true,
  "count": 2,
  "bridges": [
    {
      "id": "clxyz123abc",
      "name": "Partner API Integration",
      "type": "api",
      "direction": "outbound",
      "status": "active",
      "_count": {
        "transactions": 145
      }
    },
    {
      "id": "clxyz456def",
      "name": "Webhook Receiver",
      "type": "api",
      "direction": "inbound",
      "status": "active",
      "_count": {
        "transactions": 89
      }
    }
  ]
}
```

---

### Get Bridge

Get detailed information about a specific bridge.

**Endpoint**: `GET /api/bridges/:id`

**Response** (200 OK):
```json
{
  "success": true,
  "bridge": {
    "id": "clxyz123abc",
    "name": "Partner API Integration",
    "type": "api",
    "direction": "outbound",
    "url": "https://partner.com/api/v1/orders",
    "method": "POST",
    "authMethod": "api_key",
    "status": "active",
    "createdAt": "2025-12-17T05:30:00.000Z",
    "updatedAt": "2025-12-17T05:30:00.000Z",
    "transactions": [
      // Last 10 transactions
    ],
    "_count": {
      "transactions": 145
    }
  }
}
```

---

### Update Bridge

Update bridge configuration.

**Endpoint**: `PUT /api/bridges/:id`

**Request Body** (all fields optional):
```json
{
  "name": "Updated Bridge Name",
  "status": "inactive",
  "retryAttempts": 5
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "bridge": {
    // Updated bridge object
  }
}
```

---

### Delete Bridge

Delete a bridge and all associated transactions.

**Endpoint**: `DELETE /api/bridges/:id`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Bridge deleted successfully",
  "id": "clxyz123abc"
}
```

---

### Test Bridge

Test bridge connectivity and authentication.

**Endpoint**: `POST /api/bridges/:id/test`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Bridge connection test successful",
  "transactionId": "clxyz789ghi",
  "status": 200
}
```

---

## Webhook Endpoints

### Receive Webhook

Receive incoming webhook from external partner.

**Endpoint**: `POST /api/webhooks/:bridgeId`

**Request Body**: Any JSON payload

**Response** (200 OK):
```json
{
  "success": true,
  "transactionId": "clxyz789ghi",
  "message": "Webhook received and queued for processing"
}
```

---

### Get Webhook URL

Get the webhook URL for a bridge.

**Endpoint**: `GET /api/webhooks/:bridgeId/url`

**Response** (200 OK):
```json
{
  "bridgeId": "clxyz456def",
  "bridgeName": "Webhook Receiver",
  "webhookUrl": "https://your-domain.com/api/webhooks/clxyz456def",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  }
}
```

---

## Transaction Endpoints

### List Transactions

Get all transactions with filtering and pagination.

**Endpoint**: `GET /api/transactions`

**Query Parameters**:
- `bridgeId` (optional): Filter by bridge ID
- `status` (optional): Filter by status ('pending', 'success', 'failed')
- `direction` (optional): Filter by direction ('inbound', 'outbound')
- `limit` (optional): Results per page (default: 50, max: 100)
- `offset` (optional): Pagination offset (default: 0)
- `orderBy` (optional): Order field ('createdAt', 'completedAt', 'status')
- `order` (optional): Order direction ('asc', 'desc')

**Response** (200 OK):
```json
{
  "success": true,
  "count": 50,
  "total": 234,
  "limit": 50,
  "offset": 0,
  "transactions": [
    {
      "id": "clxyz789ghi",
      "bridgeId": "clxyz123abc",
      "direction": "outbound",
      "method": "POST",
      "url": "https://partner.com/api/v1/orders",
      "status": "success",
      "responseStatus": 200,
      "createdAt": "2025-12-17T05:35:00.000Z",
      "completedAt": "2025-12-17T05:35:01.234Z",
      "bridge": {
        "id": "clxyz123abc",
        "name": "Partner API Integration",
        "type": "api"
      }
    }
  ]
}
```

---

### Get Transaction

Get detailed information about a specific transaction.

**Endpoint**: `GET /api/transactions/:id`

**Response** (200 OK):
```json
{
  "success": true,
  "transaction": {
    "id": "clxyz789ghi",
    "bridgeId": "clxyz123abc",
    "direction": "outbound",
    "method": "POST",
    "url": "https://partner.com/api/v1/orders",
    "requestHeaders": {
      "Content-Type": "application/json",
      "X-API-Key": "***"
    },
    "requestBody": "{\"orderId\":\"12345\"}",
    "responseStatus": 200,
    "responseHeaders": {
      "content-type": "application/json"
    },
    "responseBody": "{\"success\":true,\"id\":\"67890\"}",
    "status": "success",
    "error": null,
    "createdAt": "2025-12-17T05:35:00.000Z",
    "completedAt": "2025-12-17T05:35:01.234Z",
    "bridge": {
      // Full bridge object
    }
  }
}
```

---

### Get Transaction Stats

Get transaction statistics.

**Endpoint**: `GET /api/transactions/stats`

**Query Parameters**:
- `bridgeId` (optional): Filter by bridge ID
- `startDate` (optional): Start date (ISO 8601)
- `endDate` (optional): End date (ISO 8601)

**Response** (200 OK):
```json
{
  "success": true,
  "stats": {
    "total": 234,
    "byStatus": {
      "pending": 5,
      "success": 215,
      "failed": 14
    },
    "byDirection": {
      "inbound": 123,
      "outbound": 111
    },
    "successRate": 91.88
  },
  "recent": [
    // Last 10 transactions
  ]
}
```

---

### Retry Transaction

Retry a failed outbound transaction.

**Endpoint**: `POST /api/transactions/:id/retry`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Transaction retried successfully",
  "originalTransactionId": "clxyz789ghi",
  "newTransactionId": "clxyz999xyz"
}
```

---

## Authentication Methods

### API Key

```json
{
  "authMethod": "api_key",
  "authConfig": {
    "headerName": "X-API-Key",
    "apiKey": "your-api-key-here"
  }
}
```

### Bearer Token

```json
{
  "authMethod": "bearer",
  "authConfig": {
    "token": "your-bearer-token-here"
  }
}
```

### Basic Authentication

```json
{
  "authMethod": "basic",
  "authConfig": {
    "username": "your-username",
    "password": "your-password"
  }
}
```

### OAuth2

```json
{
  "authMethod": "oauth",
  "authConfig": {
    "accessToken": "your-access-token-here"
  }
}
```

### No Authentication

```json
{
  "authMethod": "none"
}
```

---

## Error Responses

All endpoints return standard error responses:

**400 Bad Request**:
```json
{
  "error": "Missing required fields",
  "required": ["name", "type", "direction"]
}
```

**404 Not Found**:
```json
{
  "error": "Bridge not found",
  "id": "clxyz123abc"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Failed to create bridge",
  "message": "Database connection error"
}
```

---

## Usage Examples

### Example 1: Outbound API Integration

```javascript
// Create outbound bridge
const bridge = await fetch('http://localhost:4000/api/bridges', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Shopify Orders',
    type: 'api',
    direction: 'outbound',
    url: 'https://myshop.myshopify.com/admin/api/2024-01/orders.json',
    method: 'POST',
    authMethod: 'api_key',
    authConfig: {
      headerName: 'X-Shopify-Access-Token',
      apiKey: process.env.SHOPIFY_TOKEN
    }
  })
})

const { bridge: { id } } = await bridge.json()

// Test connection
await fetch(`http://localhost:4000/api/bridges/${id}/test`, {
  method: 'POST'
})
```

### Example 2: Inbound Webhook Receiver

```javascript
// Create inbound bridge
const bridge = await fetch('http://localhost:4000/api/bridges', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Stripe Webhooks',
    type: 'api',
    direction: 'inbound',
    status: 'active'
  })
})

const { bridge: { id } } = await bridge.json()

// Get webhook URL
const urlResponse = await fetch(`http://localhost:4000/api/webhooks/${id}/url`)
const { webhookUrl } = await urlResponse.json()

console.log('Configure this URL in Stripe:', webhookUrl)
```

---

## Rate Limiting

BridgeFlow enforces rate limiting globally and per-route.

- **Global**: 100 req/min per IP by default. Override with `RATE_LIMIT_GLOBAL_MAX` and `RATE_LIMIT_GLOBAL_WINDOW`.
- **Per-route**: Auth (5 attempts / 15 min per email+IP) and inbound webhooks (60 req/min per bridge) keep their tighter policies.
- **Backend**: Redis (`REDIS_URL` or `REDIS_HOST`/`REDIS_PORT`) with automatic in-memory fallback when Redis is absent.
- **Headers**: `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset` plus `X-RateLimit-*` legacy headers are returned on limited routes. `Retry-After` is sent on blocks.
- **IP controls**: Allow/Deny lists accept IP or CIDR via env (`RATE_LIMIT_ALLOW_LIST`, `RATE_LIMIT_DENY_LIST`) and admin API.
- **Anomaly detection**: automatic blocking for 404 bursts (>20/min per IP) and auth failures (>10/min on `/api/auth/*`). Defaults are tunable via env.
- **Admin API** (mTLS + auth + permission):
  - `GET /api/rate-limits/status`
  - `POST|DELETE /api/rate-limits/allow { cidr }`
  - `POST|DELETE /api/rate-limits/deny { cidr }`
  - `DELETE /api/rate-limits/blocks { ip }`

See docs/design/rate-limiting.md for full configuration surface and runbook notes.

---

## Changelog

**Unreleased** (2026-01-06)
- fix(auth): restrict BRIDGEFLOW_DEV_ADMIN fallback to UI routes only; API routes always require authentication
- fix(rate-limit): ensure enforcement is active during tests and respect RATE_LIMIT_ENABLED only when explicitly set

**v1.0.0** (2025-12-17)
- Initial release
- Bridge CRUD operations
- Webhook receiver
- Transaction logging and querying
- HTTP client with retry logic
- Support for API Key, Bearer, Basic, and OAuth2 authentication
