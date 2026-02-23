# Examples & Samples

Sample partner invoice (POST /partner/:partnerId/invoice)
```json
{
  "invoiceId": "inv-123",
  "customerId": "cust-1",
  "customerName": "ACME Corp.",
  "amount": 123.45,
  "currency": "USD",
  "invoiceDate": "2025-12-01"
}
```

Sample cURL (retrieve TP profile)
```bash
curl -X GET "https://api.local.test/api/tp/tp-123/profile" -H "X-API-Key: <org-key>"
```

Sample cURL (partner inbound)
```bash
curl -X POST "https://api.local.test/partner/p-123/invoice" -H "X-Partner-Key: <partner-key>" -H "Content-Type: application/json" -d '{"invoiceId":"inv-1","customerId":"cust-1","amount":10.0,"currency":"USD","invoiceDate":"2025-12-01"}'
```

Sample response from aggregation endpoint
```json
{
  "aggregated": {
    "id": "tp-1",
    "name": "TP",
    "organizationId": "org-1",
    "qbo": { "connected": true, "realmId": "realm-123" },
    "partnerApiKeyCount": 2,
    "deliveryMethod": "email",
    "csv": { "uploadedFiles": 3 }
  }
}
```

Notes:
- When testing locally, `IntegrationCredential` records can be created via test helpers and encrypted with the deterministic test key used in test files (`process.env.QBO_CREDENTIAL_ENCRYPTION_KEY = '01'.repeat(32)`).
- CSV inbox listing is available only when using the local mock S3 client (`api/lib/s3.js`).