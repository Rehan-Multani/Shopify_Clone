# Production Rollback Runbook

## Principles

- Application rollback does **not** automatically reverse Mongo schema/data migrations.
- Theme **published** configuration must only change via explicit publish/rollback APIs.
- Prefer rolling back the application binary first; then repair data with documented theme rollback if needed.

## Application rollback

1. Identify last known-good release tag / PM2 previous deploy artifact.
2. Redeploy previous gateway + services + frontend assets.
3. Restart processes.
4. Run health checks.
5. Run safe smoke (login, theme list, public storefront).

## Theme configuration rollback

Use merchant Theme Rollback (Wave 4) for a single-level previous published snapshot:

```text
POST /api/themes/rollback
Headers: Authorization Bearer <merchant>, x-store-id
```

Verify:

- Public storefront shows previous theme
- Draft may differ — merchant reviews before next publish

## Queue / Redis considerations

- BullMQ jobs may re-run after worker restart — experiment auto-complete is idempotent via conditional status update.
- Preview tokens stored in Redis expire via TTL; after Redis flush, tokens become invalid (expected — remint).

## Database considerations

- Do not drop collections to “fix” a release.
- Restore from backup only when application rollback is insufficient and after documenting impact.

## Verification

- [ ] Health endpoints OK
- [ ] Merchant dashboard loads
- [ ] Public storefront loads
- [ ] No surge in 5xx
- [ ] No cross-store errors in logs
