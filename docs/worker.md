# Development Worker Loop (Simulated Worker)

This project includes an in-process simulated worker that processes `DeliveryJob`s in the background.

## Purpose
- Allow fast local iteration and validation of job lifecycle behavior without needing an external worker process.
- Useful for manual testing of job transitions, retries, backoff, and audit logs.

## Auto-start behavior
- The worker loop will automatically start when you run the API server with `NODE_ENV=development` (default interval 5000ms).
- To disable the dev loop, set `DEV_WORKER_LOOP=false` in your environment.

## Configuration
- DEV_WORKER_INTERVAL_MS — interval between runLoop iterations in milliseconds (e.g., `5000`).
- DEV_WORKER_INTERVAL_SECONDS — alternate way to set interval in seconds (e.g., `5`). If both are set, `DEV_WORKER_INTERVAL_MS` takes precedence.

## Graceful shutdown
- The dev loop listens for `SIGINT` and `SIGTERM` and will abort cleanly when the server is stopped (Ctrl+C).

## How to run
- Start the server in development mode:

  NODE_ENV=development node api/server.js

- Disable the loop (if you don't want it to run automatically):

  DEV_WORKER_LOOP=false NODE_ENV=development node api/server.js

## Notes
- The loop is intentionally in-process and should not be used in production.
- For CI and automated tests we use the mock DB and invoke `runOnce()` directly (tests do not auto-start the loop).
