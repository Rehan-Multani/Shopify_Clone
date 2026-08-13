# Database Index Audit (Wave 8)

## Existing (justified)

| Collection | Index | Query pattern |
|------------|-------|---------------|
| storepages | `{ storeId, slug, themeId }` unique | Theme-scoped page load |
| themeauditevents | `{ storeId, createdAt }` / `{ storeId, action, createdAt }` | Audit list |
| themeexperiments | `{ storeId, status }` | Merchant experiment list |
| themeanalyticsevents | `{ storeId, createdAt }` | Summary windows |
| themeanalyticsevents | `{ storeId, themeId, eventType }` | Theme compare |
| themeanalyticsevents | `{ storeId, experimentId, variantKey }` | Experiment results |
| themeanalyticsevents | `{ storeId, sessionKey, eventType }` | Session funnel |

## Added in Wave 8

| Collection | Index | Justification |
|------------|-------|---------------|
| themeexperiments | `{ status, endAt }` | Auto-complete job: due running/scheduled by `endAt` |
| themeanalyticsevents | partial unique `{ storeId, eventType, orderId }` where purchase + orderId | Idempotent purchase attribution |

## Unbounded query notes

- Experiment auto-complete uses `.limit(100)` — acceptable batching.
- Analytics summary should always be time-bounded (`since`) — verified in controller.
- Audit list uses `.limit(limit)` — keep merchant UI defaults ≤ 100.

## Do not add

Blind indexes on every Mixed/meta field — cost without proven query benefit.
