/**
 * Wave 8 sign-off — cross-store AuthZ matrix against a live gateway.
 *
 * Env:
 *   GATEWAY_URL=http://localhost:5000
 *   MERCHANT_A_TOKEN=<jwt>
 *   STORE_B_ID=<other merchant store ObjectId>
 *
 * Expects 403 (or 401) on every listed mutating/private theme op.
 *
 * node services/store-service/src/utils/wave8.authzMatrix.smoke.js
 */
const BASE = process.env.GATEWAY_URL || 'http://localhost:5000';
const TOKEN = process.env.MERCHANT_A_TOKEN || '';
const STORE_B = process.env.STORE_B_ID || '';

const assert = (cond, msg) => {
    if (!cond) throw new Error(msg);
};

const call = async (method, path, body) => {
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers: {
            Authorization: `Bearer ${TOKEN}`,
            'x-store-id': STORE_B,
            'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    return { status: res.status, body: await res.json().catch(() => ({})) };
};

const run = async () => {
    assert(TOKEN, 'MERCHANT_A_TOKEN required');
    assert(STORE_B, 'STORE_B_ID required');

    const cases = [
        ['GET', '/api/themes/settings'],
        ['PUT', '/api/themes/settings', { colors: { primary: '#000' } }],
        ['POST', '/api/themes/publish', {}],
        ['POST', '/api/themes/upgrade', { themeId: 'x' }],
        ['POST', '/api/themes/rollback', {}],
        ['GET', '/api/themes/analytics/summary'],
        ['GET', '/api/themes/experiments'],
        ['GET', '/api/themes/audit'],
        ['POST', '/api/themes/activate', { themeId: 'x' }],
        ['POST', '/api/themes/remove', { themeId: 'x' }],
    ];

    const results = [];
    for (const [method, path, body] of cases) {
        const r = await call(method, path, body);
        const pass = r.status === 403 || r.status === 401;
        results.push({ method, path, status: r.status, pass });
        assert(pass, `${method} ${path} expected 401/403, got ${r.status}`);
    }

    console.log(JSON.stringify({ ok: true, suite: 'wave8.authzMatrix', results }, null, 2));
    console.log('wave8.authzMatrix.smoke.js — PASS');
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
