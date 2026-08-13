# Production Environment Checklist

> Never put real secrets in this document. Values belong in secure env stores / secret managers.

## Categories

| Variable | Category | Service(s) | Notes |
|----------|----------|------------|-------|
| `NODE_ENV` | REQUIRED | all | Must be `production` in prod |
| `MONGODB_URL` | REQUIRED / SECRET | all | Connection string (code uses `MONGODB_URL`, not `MONGODB_URI`) |
| `JWT_SECRET` | REQUIRED / SECRET | all | Must NOT use source hardcoded fallbacks in prod |
| `PREVIEW_TOKEN_SECRET` | REQUIRED / SECRET | store-service | Prefer dedicated secret; fallback `${JWT_SECRET}:preview` only for local |
| `REDIS_URL` | REQUIRED (prod) / SECRET | store-service | Preview tokens + BullMQ; memory fallback forbidden in production |
| `REQUIRE_REDIS` | OPTIONAL | store-service | Force Redis even outside production if set `true` |
| `PORT` | OPTIONAL | all | Defaults per service |
| `AUTH_SERVICE_URL` | REQUIRED | gateway, consumers | e.g. `http://localhost:5001` |
| `MERCHANT_ADMIN_SERVICE_URL` | REQUIRED | gateway, store | |
| `CATALOG_SERVICE_URL` | REQUIRED | gateway | |
| `STORE_SERVICE_URL` | REQUIRED | gateway, billing | |
| `BILLING_SERVICE_URL` | REQUIRED | gateway | |
| `FRONTEND_URL` | OPTIONAL | auth/emails | |
| `SMTP_*` | OPTIONAL / SECRET | auth/shared | Email |
| `RAZORPAY_*` | OPTIONAL / SECRET | billing | Payments |
| `CREDENTIALS_ENCRYPTION_KEY` | REQUIRED if gateways / SECRET | billing | |
| `UPLOAD_DIR` | OPTIONAL | services with uploads | |
| `VITE_API_BASE_URL` | REQUIRED (build) | admin-frontend | Gateway public API |
| `VITE_STORE_API_URL` | REQUIRED (build) | admin-frontend | Prefer gateway `/api` or store `/api` |
| `VITE_BILLING_API_URL` | REQUIRED (build) | admin-frontend | |

## Security

- [ ] No default JWT secrets in production
- [ ] Preview signing secret set
- [ ] Secrets not printed in logs or CI artifacts
- [ ] CORS restricted to real admin/storefront origins (tighten gateway open CORS before public launch)

## Database

- [ ] `MONGODB_URL` points to production cluster
- [ ] Indexes applied (see production-readiness-report)
- [ ] Backup schedule confirmed

## Redis / Queues

- [ ] `REDIS_URL` reachable from all store-service instances
- [ ] Preview mint fails closed if Redis down (production)
- [ ] BullMQ worker started with store-service

## Storage / Domains / SSL

- [ ] Uploads path writable
- [ ] Theme static assets served (`/themes`)
- [ ] TLS certificates valid
- [ ] Custom domain resolve path tested

## Monitoring / Logging

- [ ] 5xx / latency alerts configured
- [ ] Redis / queue failure alerts configured
- [ ] Morgan / access logs do not retain raw `previewToken` query values
