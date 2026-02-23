# Package API Reference

## Base URL: `/api/packages`

### 1. Ingest Package
**POST** `/`

Upload a new package for processing.

**Headers**:
- `Content-Type: application/json`
- `Authorization: Bearer <token>`

**Body**:
```json
{
  "type": "PO", // or "850", "BRIDGE_CONFIG", etc.
  "organizationId": "org_123", // Optional context
  "payload": "{\"json\": \"escaped string content or raw EDI\"}",
  "metadata": {
      "filename": "order.edi",
      "source": "ftp-connector"
  }
}
```

**Response**:
```json
{
  "success": true,
  "packageId": "pkg_clq...",
  "status": "RECEIVED"
}
```

### 2. List Packages
**GET** `/?limit=10&offset=0&type=PO`

Returns a paginated list of packages, filterable by type or status.

**Response**:
```json
{
  "success": true,
  "packages": [
    {
      "id": "pkg_clq...",
      "type": "PO",
      "status": "PROCESSED",
      "createdAt": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### 3. Get Package Details
**GET** `/:id`

Returns full details including the raw payload and processing errors if any.
