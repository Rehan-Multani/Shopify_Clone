# Production Smoke Suite

Use a **safe test merchant/store**. Avoid destructive production mutations in automated runs.

## Automated / local

```bash
node services/store-service/src/utils/wave8.smoke.js
node services/store-service/src/utils/wave7.smoke.js
node services/store-service/src/utils/previewToken.smoke.js
```

Optional load probe (gateway up):

```bash
BASE_URL=http://localhost:5000 node services/store-service/src/utils/wave8.loadProbe.js
```

## Manual checklist

- [ ] Health: gateway + store (deps) + auth + admin + catalog + billing
- [ ] Merchant login
- [ ] Theme list / Theme Store
- [ ] Preview (mint token — no JWT in URL)
- [ ] Customize section + responsive setting + media + product
- [ ] Save draft → preview → publish → public storefront
- [ ] Theme upgrade (draft) → publish
- [ ] Rollback → previous theme
- [ ] Experiment create → assign → complete → apply winner (**draft only**)
- [ ] Analytics summary (merchant-owned store only)
- [ ] Audit logs
- [ ] Consent banner → analytics gate → consent beacon (best-effort)

## Cross-store AuthZ (manual or API)

Merchant A token + Merchant B `x-store-id` must return **403** for:

- GET/PUT theme settings
- publish / upgrade / rollback / activate / remove
- analytics summary / experiments / apply-winner / audit
