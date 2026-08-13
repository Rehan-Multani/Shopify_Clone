# Backup & Restore Verification

## Scope

Critical theme platform data:

- Store theme configuration (`stores.installedThemes`, `activeTheme`, drafts)
- Published / draft home sections (`storepages`)
- Theme versions / pending / previousPublished snapshots
- Theme experiments
- Theme audit logs
- Theme analytics events (best-effort)

## Backup

Use your MongoDB provider snapshots **or**:

```bash
mongodump --uri="$MONGODB_URL" --out=/backups/storify-$(date +%Y%m%d)
```

Confirm Redis is **not** the source of truth for published themes (tokens/jobs only). Redis loss must not corrupt published configuration.

## Restore verification (non-production)

1. Restore dump into a **staging** database.
2. Point a staging store-service at that DB.
3. Verify for a known test store:
   - Active theme folder/version matches pre-backup
   - Published home sections render
   - Draft differs from published if expected
   - Experiment documents intact
   - Audit log count ≥ pre-backup sample

## Certification rule

Do **not** claim backup safety without completing a restore test and recording date/operator in `production-readiness-report.md`.
