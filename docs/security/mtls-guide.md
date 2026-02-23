# mTLS (Mutual TLS) Authentication Guide

## Overview

This guide covers the implementation of mutual TLS (mTLS) authentication in BridgeFlow. mTLS provides strong client authentication by requiring clients to present valid X.509 certificates signed by a trusted Certificate Authority.

## Table of Contents

1. [Architecture](#architecture)
2. [Certificate Generation](#certificate-generation)
3. [Configuration](#configuration)
4. [API Usage](#api-usage)
5. [Testing](#testing)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────┐
│                    mTLS Architecture                     │
└─────────────────────────────────────────────────────────┘

┌──────────────┐         TLS Handshake          ┌──────────────┐
│              │  ←─────────────────────────→   │              │
│   Client     │   - Server cert validation     │   Server     │
│ (with cert)  │   - Client cert validation     │ (Fastify)    │
│              │   - Mutual authentication      │              │
└──────────────┘                                 └──────────────┘
                                                        ↓
                                                 ┌──────────────┐
                                                 │ mTLS Plugin  │
                                                 │   Middleware │
                                                 └──────────────┘
                                                        ↓
                                    ┌───────────────────────────────┐
                                    │  Certificate Validation        │
                                    │  1. Extract from TLS socket    │
                                    │  2. Check expiry dates         │
                                    │  3. Verify fingerprint         │
                                    │  4. Verify Common Name (CN)    │
                                    │  5. Verify CA chain            │
                                    └───────────────────────────────┘
                                                        ↓
                                    ┌───────────────────────────────┐
                                    │  Route Protection             │
                                    │  - requireMTLS() enforced     │
                                    │  - optionalMTLS() permissive  │
                                    └───────────────────────────────┘
                                                        ↓
                                    ┌───────────────────────────────┐
                                    │  Audit Logging                │
                                    │  - Auth success/failure        │
                                    │  - Certificate management      │
                                    └───────────────────────────────┘
```

### Features

- **Certificate Extraction**: Extracts client certificates from TLS socket
- **Multi-stage Validation**:
  - Expiry checking (valid_from, valid_to)
  - Fingerprint matching (SHA256)
  - Common Name (CN) verification
  - CA chain validation
  - Self-signed cert detection
- **Route Protection**: Decorators for required vs optional mTLS
- **Certificate Management**: Runtime certificate addition/removal via secret manager
- **Audit Integration**: Comprehensive logging of auth events
- **Environment-aware**: Graceful degradation when disabled

---

## Certificate Generation

### Prerequisites

- OpenSSL installed
- Node.js 18+ (for certificate generation script)

### Generate Certificate Authority (CA)

```bash
# Using the provided script
node scripts/generate-certs.js ca

# Or manually with OpenSSL
openssl genrsa -out certs/ca-key.pem 4096
openssl req -new -x509 -days 3650 -key certs/ca-key.pem \
  -out certs/ca-cert.pem \
  -subj "/C=US/ST=California/L=San Francisco/O=BridgeFlow/CN=BridgeFlow CA"
```

This generates:
- `certs/ca-key.pem` - CA private key (keep secure!)
- `certs/ca-cert.pem` - CA certificate (distribute to clients)

### Generate Server Certificate

```bash
# Using the script
node scripts/generate-certs.js server

# Or manually
openssl genrsa -out certs/server-key.pem 2048
openssl req -new -key certs/server-key.pem \
  -out certs/server-csr.pem \
  -subj "/C=US/ST=California/L=San Francisco/O=BridgeFlow/CN=localhost"

openssl x509 -req -in certs/server-csr.pem \
  -CA certs/ca-cert.pem -CAkey certs/ca-key.pem -CAcreateserial \
  -out certs/server-cert.pem -days 365
```

This generates:
- `certs/server-key.pem` - Server private key
- `certs/server-cert.pem` - Server certificate

### Generate Client Certificate

```bash
# Using the script (required CN parameter)
node scripts/generate-certs.js client --cn="trading-partner-1"

# Or manually
openssl genrsa -out certs/client-trading-partner-1-key.pem 2048
openssl req -new -key certs/client-trading-partner-1-key.pem \
  -out certs/client-trading-partner-1-csr.pem \
  -subj "/C=US/ST=California/L=San Francisco/O=Trading Partner/CN=trading-partner-1"

openssl x509 -req -in certs/client-trading-partner-1-csr.pem \
  -CA certs/ca-cert.pem -CAkey certs/ca-key.pem -CAcreateserial \
  -out certs/client-trading-partner-1-cert.pem -days 365
```

This generates:
- `certs/client-{name}-key.pem` - Client private key
- `certs/client-{name}-cert.pem` - Client certificate

### Get Certificate Fingerprint

```bash
# SHA256 fingerprint (recommended)
openssl x509 -in certs/client-trading-partner-1-cert.pem -noout -fingerprint -sha256

# Example output:
# SHA256 Fingerprint=AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99
```

### Verify Certificate Chain

```bash
# Verify server certificate against CA
openssl verify -CAfile certs/ca-cert.pem certs/server-cert.pem

# Using the script
node scripts/generate-certs.js verify
```

---

## Configuration

### Environment Variables

```bash
# Enable/disable mTLS
MTLS_ENABLED=true

# Trusted certificate fingerprints (comma-separated)
MTLS_TRUSTED_FINGERPRINTS=AA:BB:CC:DD:EE:FF:...,11:22:33:44:55:66:...

# Trusted Common Names (comma-separated)
MTLS_TRUSTED_CN=trading-partner-1,trading-partner-2,admin-client

# Require CA-signed certificates (reject self-signed)
MTLS_REQUIRE_CA=true

# Enable audit logging for successful authentications
MTLS_AUDIT_SUCCESS=true
```

### Server Configuration

```javascript
// api/server.js
import fs from 'fs'
import fastify from 'fastify'
import mtlsPlugin from './lib/mtls.js'

const server = fastify({
  logger: true,
  https: {
    key: fs.readFileSync('certs/server-key.pem'),
    cert: fs.readFileSync('certs/server-cert.pem'),
    ca: fs.readFileSync('certs/ca-cert.pem'),
    requestCert: true,          // Request client certificate
    rejectUnauthorized: false   // Don't reject at TLS level (let middleware handle)
  }
})

// Register mTLS plugin
await server.register(mtlsPlugin, {
  trustedFingerprints: [
    'AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99'
  ],
  trustedCN: ['trading-partner-1', 'admin-client'],
  requireCA: true,
  auditFailures: true,
  auditSuccess: false  // Reduce noise in production
})

await server.listen({ port: 3000, host: '0.0.0.0' })
```

---

## API Usage

### Protecting Routes

#### Required mTLS (401/403 if invalid)

```javascript
// Protect admin endpoints
server.get('/api/admin/users', {
  preHandler: server.requireMTLS()
}, async (request, reply) => {
  // Only clients with valid certificates can access this
  const clientCN = request.getClientCN()
  return { message: `Hello ${clientCN}` }
})

// Protect with specific options
server.post('/api/secrets', {
  preHandler: server.requireMTLS({
    trustedCN: ['admin-client'],  // Override plugin config
    requireCA: true
  })
}, async (request, reply) => {
  // Only "admin-client" can access
  return { success: true }
})
```

#### Optional mTLS (attach cert if present)

```javascript
// Endpoint works with or without certificate
server.get('/api/status', {
  preHandler: server.optionalMTLS()
}, async (request, reply) => {
  if (request.hasClientCert()) {
    return {
      status: 'authenticated',
      client: request.getClientCN()
    }
  }
  return { status: 'anonymous' }
})
```

### Request Decorators

```javascript
// Check if request has valid client certificate
if (request.hasClientCert()) {
  // Certificate present and valid
}

// Get client Common Name
const clientCN = request.getClientCN()  // Returns null if no cert

// Access full certificate details
const cert = request.clientCert
console.log(cert.subject)       // { CN: 'trading-partner-1', O: 'Trading Partner' }
console.log(cert.issuer)        // { CN: 'BridgeFlow CA', O: 'BridgeFlow' }
console.log(cert.fingerprint256) // SHA256 fingerprint
console.log(cert.valid_to)      // Expiry date
```

### Certificate Management API

```javascript
// Add trusted certificate
await fastify.addTrustedCertificate({
  fingerprint: 'AA:BB:CC:...',
  cn: 'new-trading-partner'
})

// Remove trusted certificate
await fastify.removeTrustedCertificate('AA:BB:CC:...')
```

---

## Testing

### Unit Tests

```bash
# Run mTLS test suite (29 tests)
node --test api/tests/mtls.test.js
```

### Manual Testing with curl

```bash
# Test with valid client certificate
curl --cacert certs/ca-cert.pem \
     --cert certs/client-trading-partner-1-cert.pem \
     --key certs/client-trading-partner-1-key.pem \
     https://localhost:3000/api/admin/users

# Test without certificate (should fail)
curl --cacert certs/ca-cert.pem \
     https://localhost:3000/api/admin/users
```

### Testing with Postman

1. Import CA certificate: Settings → Certificates → CA Certificates
2. Add client certificate: Settings → Certificates → Client Certificates
   - Host: localhost:3000
   - CRT file: client-trading-partner-1-cert.pem
   - KEY file: client-trading-partner-1-key.pem
3. Make request to mTLS-protected endpoint

---

## Production Deployment

### Pre-deployment Checklist

- [ ] Generate production CA with strong key (4096-bit)
- [ ] Store CA private key in secure vault (not in source control)
- [ ] Generate server certificate with proper SANs
- [ ] Generate client certificates for each partner
- [ ] Distribute CA certificate to all clients
- [ ] Configure trusted fingerprints in secret manager
- [ ] Enable audit logging (`MTLS_AUDIT_SUCCESS=true`)
- [ ] Test certificate rotation procedure
- [ ] Document certificate issuance process
- [ ] Set up certificate expiry monitoring

### Certificate Distribution

**Server Certificate**: Deploy to application servers
- Keep private key secure (0600 permissions)
- Use environment variables or secret manager
- Never commit to source control

**Client Certificates**: Distribute to partners
- Send via secure channel (encrypted email, secure portal)
- Provide installation instructions
- Include CA certificate for server verification

**CA Certificate**: Public distribution
- Include in API documentation
- Provide via HTTPS download
- Update when CA rotates

### Certificate Rotation

#### Rotating CA Certificate

```bash
# 1. Generate new CA
node scripts/generate-certs.js ca --cn="BridgeFlow CA v2"

# 2. Generate new server cert signed by new CA
node scripts/generate-certs.js server

# 3. Deploy new certificates to servers
# 4. Update clients to trust new CA
# 5. Deprecate old CA after transition period
```

#### Rotating Client Certificates

```bash
# 1. Generate new client cert
node scripts/generate-certs.js client --cn="trading-partner-1"

# 2. Get new fingerprint
openssl x509 -in certs/client-trading-partner-1-cert.pem -noout -fingerprint -sha256

# 3. Add new fingerprint to trusted list
curl -X POST https://admin.bridgeflow.com/api/admin/mtls/certificates \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"fingerprint":"NEW:FINGERPRINT","cn":"trading-partner-1"}'

# 4. Distribute new certificate to partner
# 5. Remove old fingerprint after transition period
```

### Monitoring

Monitor certificate expiry:

```javascript
// Check certificate expiry
const daysUntilExpiry = (certValidTo) => {
  const now = new Date()
  const expiry = new Date(certValidTo)
  return Math.floor((expiry - now) / (1000 * 60 * 60 * 24))
}

// Alert if certificate expires in < 30 days
if (daysUntilExpiry(clientCert.valid_to) < 30) {
  alert('Certificate expiring soon!')
}
```

### Performance Considerations

- **Connection Pooling**: Reuse TLS connections to avoid repeated handshakes
- **Certificate Caching**: Plugin caches validated certificates for request duration
- **Audit Logging**: Set `MTLS_AUDIT_SUCCESS=false` in high-traffic environments
- **Fingerprint List**: Keep trusted fingerprint list small (<100 entries)

---

## Troubleshooting

### Common Issues

#### "Client certificate required" (401)

**Cause**: No client certificate presented

**Solution**:
1. Verify client is sending certificate
2. Check curl/Postman configuration
3. Verify certificate files are readable
4. Check TLS version compatibility

```bash
# Test certificate is readable
openssl x509 -in certs/client-cert.pem -text -noout
```

#### "Certificate validation failed" (403)

**Cause**: Certificate is invalid or not trusted

**Solution**:
1. Check certificate expiry: `openssl x509 -in cert.pem -noout -dates`
2. Verify fingerprint is in trusted list
3. Check CN is in trusted list
4. Verify CA chain is valid
5. Ensure certificate is signed by trusted CA

```bash
# Verify certificate chain
openssl verify -CAfile certs/ca-cert.pem certs/client-cert.pem
```

#### "Certificate has expired"

**Cause**: Certificate valid_to date has passed

**Solution**:
1. Generate new certificate
2. Distribute to client
3. Update trusted fingerprints

#### "Self-signed certificates not allowed"

**Cause**: Client presented self-signed certificate and `requireCA=true`

**Solution**:
1. Sign certificate with your CA
2. Or disable `MTLS_REQUIRE_CA` (not recommended for production)

#### Fingerprint Mismatch

**Cause**: Certificate fingerprint not in trusted list

**Solution**:
```bash
# Get current fingerprint
openssl x509 -in cert.pem -noout -fingerprint -sha256

# Add to environment
export MTLS_TRUSTED_FINGERPRINTS="AA:BB:CC:...,NEW:FINGERPRINT"

# Or add via API
curl -X POST /api/admin/mtls/certificates \
  -d '{"fingerprint":"NEW:FINGERPRINT","cn":"partner"}'
```

### Debug Mode

Enable verbose logging:

```javascript
const server = fastify({
  logger: {
    level: 'debug',
    prettyPrint: true
  }
})
```

Check audit logs:

```sql
SELECT * FROM audit_logs
WHERE event LIKE 'mtls.%'
ORDER BY timestamp DESC
LIMIT 50;
```

### Security Best Practices

1. **Strong Keys**: Use 4096-bit keys for CA, 2048-bit for certificates
2. **Short Validity**: 365 days max for client certs, 90 days for server certs
3. **Fingerprint Pinning**: Use fingerprints for high-security endpoints
4. **Regular Rotation**: Rotate certificates annually
5. **Audit Logging**: Monitor all auth attempts
6. **Secret Storage**: Never commit private keys to source control
7. **Access Control**: Restrict CA private key to dedicated systems
8. **Revocation**: Implement certificate revocation process

---

## API Reference

### Plugin Options

```typescript
interface MtlsOptions {
  enabled?: boolean              // Enable/disable plugin (default: env.MTLS_ENABLED)
  trustedFingerprints?: string[] // SHA256 fingerprints (default: env.MTLS_TRUSTED_FINGERPRINTS)
  trustedCN?: string[]           // Trusted Common Names (default: env.MTLS_TRUSTED_CN)
  requireCA?: boolean            // Reject self-signed certs (default: true)
  auditFailures?: boolean        // Log failed auth attempts (default: true)
  auditSuccess?: boolean         // Log successful auth (default: false)
}
```

### Decorators

```typescript
// Server decorators
fastify.requireMTLS(options?: MtlsOptions): FastifyMiddleware
fastify.optionalMTLS(): FastifyMiddleware
fastify.addTrustedCertificate(certData: CertData): Promise<{success: boolean}>
fastify.removeTrustedCertificate(fingerprint: string): Promise<{success: boolean}>

// Request decorators
request.hasClientCert(): boolean
request.getClientCN(): string | null
request.clientCert: CertificateInfo | undefined
```

### Audit Events

- `mtls.auth.success` - Successful authentication
- `mtls.auth.failed` - Failed authentication
- `mtls.cert.added` - Trusted certificate added
- `mtls.cert.removed` - Trusted certificate removed

---

## Resources

- [RFC 8705: OAuth 2.0 Mutual-TLS Client Authentication](https://www.rfc-editor.org/rfc/rfc8705.html)
- [OpenSSL Documentation](https://www.openssl.org/docs/)
- [Node.js TLS/SSL](https://nodejs.org/api/tls.html)
- [Fastify Plugin Guide](https://www.fastify.io/docs/latest/Reference/Plugins/)

## Support

For questions or issues:
- Check troubleshooting guide above
- Review audit logs for auth failures
- Consult security team for certificate management
- File issue in project repository
