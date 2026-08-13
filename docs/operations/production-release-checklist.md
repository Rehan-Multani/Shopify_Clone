# Production Release Checklist

## Build & config

- [ ] Production build passed (`admin-frontend`)
- [ ] Environment variables verified
- [ ] Redis configured (`REDIS_URL`)
- [ ] Database verified (`MONGODB_URL`)
- [ ] JWT / preview secrets are non-default
- [ ] Queue workers healthy (store-service)

## Data safety

- [ ] Backup verified
- [ ] Restore tested (non-production)

## Security

- [ ] AuthZ audit passed (Wave 8 smoke)
- [ ] Preview-token tests passed
- [ ] Theme package validation passed
- [ ] Access logs redact preview tokens
- [ ] Secrets not logged

## Reliability

- [ ] Redis multi-instance behavior verified (or blocked with CONDITIONALLY_READY)
- [ ] BullMQ / auto-complete idempotency verified
- [ ] Failure recovery documented

## Product E2E (safe test store)

- [ ] Merchant builder draft → preview → publish
- [ ] Theme upgrade → publish
- [ ] Theme rollback
- [ ] Experiment create → assign → complete → apply winner (draft only)
- [ ] Marketplace install → customize → publish
- [ ] Public storefront home/catalog/product/cart

## Consent & analytics

- [ ] Consent banner works
- [ ] Analytics gated until granted
- [ ] Consent persistence best-effort / non-blocking

## Performance gate

- [ ] Public JS ≈ 305 KB (± minor build variance)
- [ ] Public gzip ≈ 85 KB
- [ ] Builder remains isolated from public entry

## Monitoring

- [ ] Monitoring active
- [ ] Alerts active
- [ ] Health checks verified

## Final

- [ ] Production smoke passed
- [ ] Production readiness report generated
- [ ] No critical open blocker
