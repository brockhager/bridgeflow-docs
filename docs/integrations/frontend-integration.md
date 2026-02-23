# Frontend Integration Guide ✅

This guide helps frontend engineers integrate with the BridgeFlow CSV mailbox and QBO sync APIs during development.

## Authentication & Headers 🔐
- Use `X-API-Key` header (case-insensitive) or `Authorization: Bearer <key>`.
- The API key maps to an `organizationId` via `validateCustomerApiKey` middleware and must be included on every request.

Example header:

`X-API-Key: <your-api-key>`

## CORS ⚠️
- The API allows the following local origins by default:
  - `http://localhost:3000`, `https://localhost:3000`
  - `http://localhost:3001`, `https://localhost:3001`
  - `http://localhost:4000`, `https://localhost:4000`, `http://localhost:4001`, `https://localhost:4001`

If your dev UI runs on another port, update `api/server.js` `fastifyCors` allowed origins accordingly.

## Debugging: Dev-only endpoint 🔧
- `GET /api/debug/customer-context` (development only)
- Requires `X-API-Key` and returns a minimal JSON object showing mapped identity to aid debugging:

Response example:
```
{
  "environment": "development",
  "customerOrgId": "org-123",
  "customerApiKeyId": "key-abc",
  "apiKeyProvided": true
}
```

> Note: The endpoint intentionally does NOT return the API key value for safety.

## CSV Upload (Mailbox) — Endpoint 📤
- `POST /api/upload/csv`
- Headers: `X-API-Key`, `Content-Type: text/csv`
- Body: the CSV payload (text/csv)

Successful response:
```
{ "success": true, "message": "Enqueued for processing" }
```

### Common error responses and suggested UI messages
- 401 Unauthorized
  - { error: 'Unauthorized', message: 'API key required' }
  - UI: "Missing or invalid API key"
- 400 Bad Request — invalid content type
  - { error: 'Bad Request', message: 'Expected text/csv' }
  - UI: "Please upload a CSV file"
- 413 Payload Too Large
  - UI: "File too large"
- 422 Unprocessable Entity — template/mapping issues
  - { error: 'Invalid Template', message: 'Missing required columns: [purchaseOrderId, vendorId]' }
  - UI: "CSV is missing required columns"

## Sample CSV (minimal)
- Location: `docs/examples/sample_purchase_orders.csv`

Columns expected by the platform mapping (at minimum):
- `purchaseOrderId`, `vendorId`, `orderDate`, `amount`, `currency`

Sample row:
```
purchaseOrderId,vendorId,orderDate,amount,currency
PO-123,VEN-10,2025-06-01,120.50,USD
```

## cURL examples 🧪
Upload CSV:
```
curl -X POST https://api.local.test/api/upload/csv \
  -H "X-API-Key: <your-key>" \
  -H "Content-Type: text/csv" \
  --data-binary @docs/examples/sample_purchase_orders.csv
```
Get debug context (dev-only):
```
curl -X GET https://api.local.test/api/debug/customer-context -H "X-API-Key: <your-key>"
```

## Tips for frontend engineers 💡
- Use the dev debug endpoint to verify your key is mapped to the expected organization before testing uploads.
- Check CORS origin if you see preflight (OPTIONS) failures.
- If you get an `Invalid Template` error, download the last failed payload from the inbox to inspect column names.

---

If you'd like, I can add a quick UI test (Playwright) that exercises the upload flow and asserts error messages — say the word and I’ll add it. 
