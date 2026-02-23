# Package Service Documentation

The Package Service is the central ingestion and processing engine for BridgeFlow. It handles all incoming data payloads, whether they are EDI files, JSON documents, or Bridge Configurations.

## Contents

- **[Package Lifecycle](./package-lifecycle.md)**
  - Status transitions (`RECEIVED`, `PARSING`, `PROCESSED`, `FAILED`, `ACK_GENERATED`)
  - Integration with Temporal Workflows

- **[API Reference](./api-reference.md)**
  - `POST /api/packages`: Ingestion endpoint
  - `GET /api/packages`: List and filter packages
  - `GET /api/packages/:id`: Retrieve package details

- **[Bridge Configuration Payload](./bridge-config-payload.md)**
  - Structure of the `BRIDGE_CONFIG` package type used by the Canvas Assembly UI to provision resources.
