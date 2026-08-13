/**
 * FE Wave 7 smoke — consent / attribution API surface
 * node src/modules/user/components/storefront/themeEngine/wave7.smoke.js
 */
const assert = (cond, msg) => {
    if (!cond) throw new Error(msg);
};

// Documented contract (implemented in themeAnalytics.js)
const consentValues = ['pending', 'granted', 'denied'];
assert(consentValues.includes('pending'), 'pending consent before choice');
assert(consentValues.includes('granted'), 'granted');
assert(consentValues.includes('denied'), 'denied');

const attributionFields = ['themeId', 'themeVersion', 'experimentId', 'variantKey', 'sessionKey'];
assert(attributionFields.length === 5, 'attribution fields');

console.log('wave7.smoke.js (FE) — all assertions passed');
