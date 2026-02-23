# Example Monorepo Tree (detailed)

This is a concrete example that can be created with small shell script or scaffolding tool.

```
/packages
  /services
    /api-gateway
      package.json
      src/
    /tenant-service
      package.json
      src/
    /connector-service
      package.json
      src/
    /workflow-service
      package.json
      src/
    /billing-service
      package.json
      src/
    /audit-service
      package.json
      src/
  /libs
    /db
      package.json
      src/
    /auth
      package.json
      src/
    /observability
      package.json
      src/
    /secrets
      package.json
      src/
    /shared
      package.json
      src/

/.github/workflows
  - ci.yml
  - security-scan.yml

/pnpm-workspace.yaml
/package.json
/turbo.json
/README.md
```

Each service is an independent package with its own tests and CI checks. Shared libs are strictly versioned within the monorepo.
