# Monitoring & Alerts

## Metrics to monitor

| Signal | Why | Suggested alert |
|--------|-----|-----------------|
| Gateway 5xx rate | Customer impact | >1% for 5m |
| p95 API latency | UX | >2s sustained |
| Mongo connection errors | Data plane | any sustained |
| Redis errors / preview 503 | Preview + queues | any sustained in prod |
| BullMQ failed jobs | Experiment auto-complete | >0 repeated |
| Theme migration / upgrade 4xx–5xx | Merchant ops | spike |
| Analytics ingest 5xx | Degraded analytics | warn only (non-blocking) |
| Auth failure spike | Attack / misconfig | unusual spike |

## Health endpoints

- `/api/health` (gateway)
- `/api/store/health` (include Redis status in production)
- `/api/auth/health`, `/api/admin/health`, `/api/catalog/health`, `/api/billing/health`

## Logging rules

**Include:** service name, operation, storeId when safe, error category, correlation/request id if available.

**Never log:** JWT, preview tokens, passwords, payment secrets, full order PII payloads, encryption keys.

## Noise control

- Prefer burn-rate / sustained thresholds over single-error pages.
- Analytics failures are warning-level, not page-level incidents, unless volume indicates outage of core APIs.
