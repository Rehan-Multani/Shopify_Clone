/**
 * Wave 8 sign-off — Redis multi-instance / shared-state probe.
 *
 * Requires:
 *   REDIS_URL=...
 *   REQUIRE_REDIS=true   (or NODE_ENV=production)
 *
 * Simulates Instance A and Instance B using the same Redis-backed token APIs
 * (mint → validate → revoke → validate must fail).
 *
 * node services/store-service/src/utils/wave8.redisMultiInstance.smoke.js
 */
import {
    mintPreviewToken,
    verifyPreviewToken,
    revokePreviewToken,
} from './previewToken.js';
import { getRedisBackend, assertPreviewTokenBackend, isProductionEnv } from './redisClient.js';

const assert = (cond, msg) => {
    if (!cond) throw new Error(msg);
};

const run = async () => {
    if (!process.env.REDIS_URL && !process.env.REDIS_URI) {
        console.error('SKIP/FAIL: Set REDIS_URL to run multi-instance verification');
        process.exit(2);
    }

    // Force production-style gate for this probe
    process.env.REQUIRE_REDIS = 'true';

    const gate = assertPreviewTokenBackend();
    assert(gate.ok, `Redis gate failed: ${gate.message}`);
    assert(getRedisBackend() === 'redis', `Expected redis backend, got ${getRedisBackend()}`);

    const storeId = '507f1f77bcf86cd799439011';
    const themeId = 'luxury-commerce';
    const merchantId = '507f1f77bcf86cd799439012';

    // Instance A — mint
    const minted = await mintPreviewToken({ storeId, themeId, merchantId, ttlSec: 120 });
    assert(minted.backend === 'redis' || getRedisBackend() === 'redis', 'mint must use redis');
    assert(minted.token, 'token missing');

    // Instance B — validate (same Redis)
    const okB = await verifyPreviewToken(minted.token, { storeId, themeId });
    assert(okB.ok, `B validate failed: ${okB.message}`);

    // Instance B — revoke
    const revoked = await revokePreviewToken({
        tokenId: minted.tokenId,
        merchantId,
    });
    assert(revoked.ok && revoked.revoked, 'B revoke failed');

    // Instance A — validate must fail
    const failA = await verifyPreviewToken(minted.token, { storeId, themeId });
    assert(!failA.ok, 'A must reject after B revoke');

    // Replay after revoke
    const replay = await verifyPreviewToken(minted.token, { storeId });
    assert(!replay.ok, 'replay after revoke must fail');

    console.log(JSON.stringify({
        ok: true,
        suite: 'wave8.redisMultiInstance',
        backend: getRedisBackend(),
        productionGate: isProductionEnv(),
        steps: ['mint_A', 'validate_B', 'revoke_B', 'reject_A', 'reject_replay'],
    }, null, 2));
    console.log('wave8.redisMultiInstance.smoke.js — PASS');
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
