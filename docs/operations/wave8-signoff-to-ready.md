# Wave 8 — Sign-off Path to READY

> **Not a Wave 9.** These are release evidence tasks only.  
> Do not rewrite Theme Engine, SectionRenderer, analytics, or marketplace architecture.  
> Performance gate already **PASS** — do not optimize bundles for READY.

Current certification: **CONDITIONALLY_READY**  
Target: **READY — Production Release Certified**

```text
CONDITIONALLY_READY
        │
        ├── 1. Redis multi-instance (A ↔ B)
        ├── 2. Backup → Restore drill
        ├── 3. BullMQ worker failure/recovery
        ├── 4. Staging E2E + AuthZ matrix
        └── Production sign-off → READY
```

---

## 1. Redis multi-instance verification (Critical)

**Prereq:** Shared `REDIS_URL` reachable from two store-service processes.

```bash
# Terminal A — instance A (port 5004)
cd services/store-service
set REDIS_URL=redis://127.0.0.1:6379
set REQUIRE_REDIS=true
set PORT=5004
node src/server.js

# Terminal B — instance B (port 5006)
set REDIS_URL=redis://127.0.0.1:6379
set REQUIRE_REDIS=true
set PORT=5006
node src/server.js
```

Or run the dedicated probe (no HTTP servers required — same Redis client API):

```bash
# From services/store-service with REDIS_URL set
set REDIS_URL=redis://127.0.0.1:6379
set REQUIRE_REDIS=true
node src/utils/wave8.redisMultiInstance.smoke.js
```

**Pass criteria:**

| Step | Expected |
|------|----------|
| Mint on process A | token + `backend: redis` |
| Validate on process B | `ok: true` |
| Revoke on process B | `revoked: true` |
| Validate on process A | `ok: false` (revoked) |
| TTL expiry | validate fails after TTL |
| Redis down (prod gate) | mint returns 503 — **no memory fallback** |

**Record:** date, Redis host (no password), operator, PASS/FAIL → update readiness report.

---

## 2. Backup → Restore drill (Critical)

**Non-production only.**

```bash
# Backup
mongodump --uri="%MONGODB_URL%" --out=D:\backups\storify-wave8-%DATE%

# Restore into staging DB (separate database name)
mongorestore --uri="%MONGODB_STAGING_URL%" --drop D:\backups\storify-wave8-...
```

**Verify on staging test store:**

- [ ] `activeTheme` folder/version matches pre-backup note
- [ ] Published home sections render
- [ ] Draft ≠ published if that was true pre-backup
- [ ] ≥1 experiment document intact (if any)
- [ ] Audit log sample present

**Pass criteria:** Restore completes; integrity checks above signed.  
**Fail if:** Only dump succeeded with no restore verification.

---

## 3. BullMQ live failure/recovery (High)

**Prereq:** Redis + store-service with experiment worker running.

1. Create staging experiment with `status=running` and `endAt` = now − 1 minute.
2. Confirm auto-complete job marks it `completed` once (audit: `EXPERIMENT_AUTO_COMPLETED`).
3. Kill store-service worker process (or `pm2 stop store-service`).
4. Restart store-service.
5. Re-queue / wait for poller — run `completeExpiredExperiments` again (or wait for job).
6. Confirm experiment stays `completed` (no flip); audit does **not** duplicate incorrectly if idempotency holds (second run: no second transition).

**Pass criteria:**

- Job executes after `endAt`
- Worker restart recovers queue/poller
- Second completion attempt is idempotent (status remains correct)

---

## 4. Staging E2E + AuthZ matrix (High)

Use **safe test merchants** A and B.

### Merchant builder E2E

Login → Themes → Preview → Customize → responsive + media + product → Save draft → Preview → Publish → public storefront → Upgrade → Publish → Rollback.

### Experiment E2E

Create → allocate → start → assign visitors → end/auto-complete → results → apply winner → **draft only** → manual publish.

### Marketplace E2E

Theme Store → Install (draft) → Customize → Preview → Publish → Updates path.

### AuthZ matrix (Merchant A token + Merchant B `x-store-id`)

| Operation | Expected |
|-----------|----------|
| GET `/api/themes/settings` | 403 |
| PUT `/api/themes/settings` | 403 |
| POST `/api/themes/publish` | 403 |
| POST `/api/themes/upgrade` | 403 |
| POST `/api/themes/rollback` | 403 |
| GET `/api/themes/analytics/summary` | 403 |
| GET `/api/themes/experiments` | 403 |
| POST `/api/themes/experiments/:id/apply-winner` | 403 |
| GET `/api/themes/audit` | 403 |

Optional helper (needs tokens + IDs):

```bash
set GATEWAY_URL=http://localhost:5000
set MERCHANT_A_TOKEN=...
set STORE_B_ID=...
node services/store-service/src/utils/wave8.authzMatrix.smoke.js
```

---

## Sign-off checklist → READY

- [ ] Redis multi-instance PASS (evidence attached)
- [ ] Backup restore drill PASS (date/operator)
- [ ] BullMQ failure/recovery PASS
- [ ] Staging E2E PASS
- [ ] AuthZ matrix PASS
- [ ] Performance gate still ≈ 305 KB / 85 KB gzip (re-check only if FE changed)
- [ ] Update `production-readiness-report.md` status to **READY**
- [ ] No critical open blocker

When all boxes checked:

> **READY — Production Release Certified**

**Out of scope for READY:** author/review console (only needed for third-party theme marketplace launch).
