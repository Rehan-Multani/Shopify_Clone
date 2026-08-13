/**
 * node services/store-service/src/utils/themeAnalytics.smoke.js
 */
import {
    stripSensitiveMeta,
    buildThemeEventPayload,
} from './themeAnalyticsHelpers.js';

const assert = (cond, msg) => {
    if (!cond) throw new Error(msg);
};

const cleaned = stripSensitiveMeta({
    email: 'x@y.com',
    password: 'secret',
    token: 'jwt',
    section: 'hero',
});
assert(!cleaned.email && !cleaned.password && !cleaned.token, 'PII stripped');
assert(cleaned.section === 'hero', 'safe meta kept');

const payload = buildThemeEventPayload({
    storeId: '507f1f77bcf86cd799439011',
    themeId: 'electronics-pro',
    themeVersion: '1.0.0',
    eventType: 'product_view',
    meta: { email: 'leak@x.com', sku: 'ABC' },
});
assert(payload.themeId === 'electronics-pro', 'theme attached');
assert(payload.themeVersion === '1.0.0', 'version attached');
assert(!payload.meta.email, 'no sensitive data');
assert(payload.meta.sku === 'ABC', 'useful meta kept');

let threw = false;
try {
    buildThemeEventPayload({ storeId: 'x', eventType: 'hack' });
} catch {
    threw = true;
}
assert(threw, 'invalid event rejected');

console.log('themeAnalytics.smoke.js — all assertions passed');
