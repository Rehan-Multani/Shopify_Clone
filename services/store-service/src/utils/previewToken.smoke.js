/**
 * Wave 6 smoke — preview tokens (async Redis/memory), lifecycle, revoke, rate limit.
 * node services/store-service/src/utils/previewToken.smoke.js
 */
import {
    mintPreviewToken,
    verifyPreviewToken,
    revokePreviewToken,
    checkPreviewTokenRateLimit,
    PREVIEW_TOKEN_PURPOSE,
} from './previewToken.js';
import jwt from 'jsonwebtoken';

const assert = (cond, msg) => {
    if (!cond) throw new Error(msg);
};

const run = async () => {
    const minted = await mintPreviewToken({
        storeId: 'store-aaa',
        themeId: 'theme-bbb',
        merchantId: 'merchant-ccc',
        ttlSec: 120,
    });
    assert(minted.token, 'token minted');
    assert(minted.storeId === 'store-aaa', 'storeId');
    assert(minted.themeId === 'theme-bbb', 'themeId');

    const ok = await verifyPreviewToken(minted.token, { storeId: 'store-aaa', themeId: 'theme-bbb' });
    assert(ok.ok === true, 'valid token');
    assert(ok.claims.purpose === PREVIEW_TOKEN_PURPOSE, 'purpose');

    const wrongStore = await verifyPreviewToken(minted.token, { storeId: 'other-store' });
    assert(wrongStore.ok === false && wrongStore.status === 403, 'wrong store rejected');

    const wrongTheme = await verifyPreviewToken(minted.token, { storeId: 'store-aaa', themeId: 'wrong' });
    assert(wrongTheme.ok === false && wrongTheme.status === 403, 'wrong theme rejected');

    const missing = await verifyPreviewToken('');
    assert(missing.ok === false && missing.status === 401, 'missing rejected');

    const fakeMerchant = jwt.sign({ id: 'merchant-ccc' }, process.env.JWT_SECRET || 'super_secret_jwt_key_for_storify_2026');
    const merchantAsPreview = await verifyPreviewToken(fakeMerchant);
    assert(merchantAsPreview.ok === false, 'merchant JWT not accepted as preview token');

    const revoked = await revokePreviewToken({ token: minted.token, merchantId: 'merchant-ccc' });
    assert(revoked.ok === true && revoked.revoked === true, 'revoked');
    const afterRevoke = await verifyPreviewToken(minted.token, { storeId: 'store-aaa' });
    assert(afterRevoke.ok === false, 'revoked token rejected');

    const rate = await checkPreviewTokenRateLimit('rate-merchant-1', { max: 2, windowSec: 60 });
    assert(rate.ok, 'rate 1');
    const rate2 = await checkPreviewTokenRateLimit('rate-merchant-1', { max: 2, windowSec: 60 });
    assert(rate2.ok, 'rate 2');
    const rate3 = await checkPreviewTokenRateLimit('rate-merchant-1', { max: 2, windowSec: 60 });
    assert(!rate3.ok && rate3.status === 429, 'rate limited');

    console.log('previewToken.smoke.js — all assertions passed');
};

run().catch((err) => {
    console.error(err);
    process.exit(1);
});
