# Production Readiness Report — Wave 8

**Date:** 2026-08-13  
**Scope:** Theme platform Waves 1–7 certification  
**Status:** **CONDITIONALLY_READY**

## Evidence summary

### Passed with evidence

| Area | Evidence |
|------|----------|
| Production env gate | `prodEnv.js` + `wave8.smoke.js` — production fails closed without Redis / default JWT |
| Preview token failures | `wave8.smoke.js` / `previewToken.smoke.js` — valid, wrong store, malformed, wrong purpose, bad signature, revoke |
| Preview read-only | store-service middleware blocks non-GET except analytics/consent |
| Theme package validation | `validateThemePackage` + luxury-commerce smoke |
| Cross-store AuthZ fix | `requireOwnedStore` applied to theme mutate/read APIs + analytics merchant APIs |
| Consent persistence | Best-effort `POST /themes/consent` + `navigator.sendBeacon` |
| Health dependencies | `/api/store/health` reports mongo + redis + preview gate |
| Logging | Gateway morgan redacts `previewToken` |
| CORS | Production origin allow-list enforced |
| Indexes | `status+endAt`, purchase `orderId` partial unique — see `database-index-audit.md` |
| Performance gate | Build 2026-08-13: Public JS **305.03 KB** / gzip **84.53 KB**; Builder **243.29 KB** / gzip **59.61 KB** |
| Load probe (local) | gateway_health p50=2ms p95=8ms err=0; store_health p50=2ms p95=3ms err=0 (N=30) |
| Ops docs | deploy / rollback / env / monitoring / release / smoke / backup |

### Not fully verified in this environment

| Area | Gap | Impact |
|------|-----|--------|
| Redis multi-instance | `REDIS_URL` not configured here — backend=`memory` | **Blocker for READY** until A/B mint→validate→revoke across 2 instances on shared Redis |
| Backup restore | Restore drill not executed | **Blocker for READY** |
| Full merchant E2E | Interactive builder/upgrade/experiment/marketplace flows checklist only | High — run against staging |
| BullMQ live worker chaos | Idempotency code reviewed + smoke callable; live Redis worker restart not run | High |
| Failure/chaos (DB/gateway restart) | Documented; not executed | Medium |

## Critical open blockers (must clear for READY)

1. Configure production `REDIS_URL` and verify multi-instance preview token behavior.
2. Perform Mongo backup **restore** in non-production and record operator/date.
3. BullMQ worker failure/recovery on staging Redis.
4. Staging full E2E + cross-store AuthZ matrix.

**Executable sign-off path:** see [`wave8-signoff-to-ready.md`](./wave8-signoff-to-ready.md)  
(Helpers: `wave8.redisMultiInstance.smoke.js`, `wave8.authzMatrix.smoke.js`)

**No Wave 9.** Remaining work is release evidence only. Performance gate already PASS — do not chase bundle size.
3. Execute production smoke checklist on staging with real merchant test store (AuthZ cross-store API script included).

## High (non-blocking for CONDITIONAL launch with mitigations)

- Complete live BullMQ worker restart + duplicate job run on staging Redis.
- Expand load probe to authenticated preview-token mint/validate under staging auth.
- Confirm gateway `allowedOrigins` includes all production storefront domains before cutover.

## Certification decision

**CONDITIONALLY_READY** — commercially complete platform may enter limited production / staging soak **only after** Redis multi-instance and restore verification are signed off. Not marked READY because Wave 8 definition of done requires those evidence items.

## Recommended post-launch work

- Continuous load baselines on staging
- Alert tuning after 7 days of noise observation
- Optional author submission console (not required for first-party themes)
- Periodic restore drills (quarterly)
