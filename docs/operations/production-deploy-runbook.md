# Production Deploy Runbook

## Pre-deploy

1. Confirm Wave 8 production readiness report is `READY` or accepted `CONDITIONALLY_READY`.
2. Backup MongoDB (themes, store pages, experiments, audit, orders).
3. Confirm Redis is healthy and `REDIS_URL` set on all store-service instances.
4. Confirm env checklist complete (`production-env-checklist.md`).
5. Tag release commit.

## Build

```bash
# Frontend
cd admin-frontend && npm ci && npm run build

# Services (example PM2 workspace)
cd services && npm ci
# ensure each service package installs (store-service needs ioredis + bullmq)
```

## Deploy

1. Deploy gateway + microservices (auth, merchant-admin, catalog, store, billing).
2. Deploy `admin-frontend/dist` to web root / CDN.
3. Restart PM2 processes (`ecosystem.config.cjs`) with production env injected.
4. Confirm store-service logs: Redis backend `redis`, ExperimentAutoComplete BullMQ/poller started.

## Migrations

- Prefer additive schema changes only.
- Theme config migrations remain merchant-approved (Wave 4) — do **not** auto-publish.
- Index additions are non-blocking; create in background when possible.

## Health checks

```text
GET /api/health
GET /api/auth/health
GET /api/admin/health
GET /api/catalog/health
GET /api/store/health
GET /api/billing/health
```

Store health should report Redis dependency status in production.

## Smoke

Run production smoke checklist (`production-release-checklist.md` smoke section) against a **safe test merchant/store**.

## Monitor

Watch for 15–30 minutes:

- 5xx rate
- Preview-token 503s
- Queue failures
- Mongo errors
- Storefront JS load errors

## Release

If healthy: announce release.
If critical failure: follow `production-rollback-runbook.md`.
