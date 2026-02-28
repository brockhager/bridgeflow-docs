# BridgeFlow Architecture Overview

Last updated: February 23, 2026

## 1. System Overview

BridgeFlow is a logistics runtime platform that provides real-time visibility and control over distributed supply chain operations.

**Public endpoint**: `https://control-tower.up.railway.app`

The platform serves:
- Public web interface for tracking and monitoring
- Public status API for integration partners
- Real-time event processing and case management

## 2. Platform Capabilities

### 2.1 Real-time Monitoring
- Live shipment tracking and status updates
- Weather-based risk assessment
- Automated escalation and alerting
- Resilience projection and analytics

### 2.2 Event Processing
- Normalized event ingestion from multiple sources
- Real-time policy evaluation and risk scoring
- Automated case creation and lifecycle management
- Tenant-isolated processing with data privacy

## 3. Public API Surface

### Public Web Interface
- `GET /` - Main dashboard and tracking interface
- `GET /home` - Detailed monitoring view

Features:
- Interactive map with risk-based visual indicators
- Real-time weather conditions
- Anonymized activity feed

### Public Status API
- `GET /api/v1/public/resilience-status`
- Rate limited for fair usage
- Structured JSON responses for integration
- Error handling with standard HTTP status codes

## 4. Integration Model

### Event Ingestion
BridgeFlow accepts normalized events from external systems via secure APIs:
- Standardized event envelope
- Tenant-scoped data isolation
- Idempotent processing guarantees
- Real-time processing with sub-second latency

### Data Privacy
- Tenant isolation at database level
- Anonymized public data
- GDPR-compliant data handling
- Secure audit trails

## 5. Technology Stack

BridgeFlow uses modern, scalable technologies:
- **Backend**: FastAPI with Python
- **Frontend**: Modern JavaScript with HTML5
- **Database**: PostgreSQL for reliability
- **Deployment**: Railway cloud platform
- **Monitoring**: Comprehensive observability stack

## 6. Performance & Reliability

- **Availability**: 99.9% uptime SLA
- **Response Time**: Sub-second API responses
- **Scalability**: Auto-scaling based on load
- **Data Freshness**: Real-time updates

## 7. Getting Started

For integration documentation and API specifications, see:
- [API Reference](api-reference.md)
- [Integration Guide](products/control-tower/integration-guide.md)
- [Developer Onboarding](overview/onboarding.md)
