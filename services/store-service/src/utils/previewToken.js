/**
 * Short-lived signed theme preview tokens (Wave 5/6).
 * Merchant JWT must NEVER be placed in iframe URLs.
 * Replay/TTL state: Redis when available, memory fallback.
 */
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import {
    redisSetEx,
    redisGet,
    redisDel,
    redisIncrWithTtl,
    getRedisBackend,
    assertPreviewTokenBackend,
} from './redisClient.js';

const PREVIEW_PURPOSE = 'theme-preview';
const DEFAULT_TTL_SEC = 8 * 60; // 8 minutes
const JWT_SECRET = () => process.env.JWT_SECRET || 'super_secret_jwt_key_for_storify_2026';
const PREVIEW_SECRET = () => process.env.PREVIEW_TOKEN_SECRET || `${JWT_SECRET()}:preview`;
const tokenKey = (tokenId) => `preview-token:${tokenId}`;
const rateKey = (merchantId) => `preview-token-rate:${merchantId}`;

export const mintPreviewToken = async ({
    storeId,
    themeId = '',
    merchantId,
    ttlSec = DEFAULT_TTL_SEC,
} = {}) => {
    if (!storeId) throw new Error('storeId is required');
    if (!merchantId) throw new Error('merchantId is required');

    const backendGate = assertPreviewTokenBackend();
    if (!backendGate.ok) {
        const err = new Error(backendGate.message);
        err.status = backendGate.status || 503;
        throw err;
    }

    const ttl = Math.min(Math.max(Number(ttlSec) || DEFAULT_TTL_SEC, 60), 15 * 60);
    const tokenId = crypto.randomBytes(16).toString('hex');
    const nowSec = Math.floor(Date.now() / 1000);
    const expiresAtSec = nowSec + ttl;

    const payload = {
        purpose: PREVIEW_PURPOSE,
        storeId: String(storeId),
        themeId: String(themeId || ''),
        merchantId: String(merchantId),
        tokenId,
        iat: nowSec,
        exp: expiresAtSec,
    };

    const token = jwt.sign(payload, PREVIEW_SECRET(), { algorithm: 'HS256' });
    await redisSetEx(tokenKey(tokenId), ttl, JSON.stringify({
        storeId: payload.storeId,
        themeId: payload.themeId,
        merchantId: payload.merchantId,
        status: 'active',
    }));

    return {
        token,
        expiresAt: new Date(expiresAtSec * 1000).toISOString(),
        storeId: payload.storeId,
        themeId: payload.themeId,
        tokenId,
        ttlSec: ttl,
        backend: getRedisBackend(),
    };
};

/**
 * Verify preview token. Does NOT accept merchant session JWTs.
 */
export const verifyPreviewToken = async (rawToken, { storeId, themeId } = {}) => {
    if (!rawToken) {
        return { ok: false, status: 401, message: 'Preview token missing' };
    }

    let decoded;
    try {
        decoded = jwt.verify(String(rawToken), PREVIEW_SECRET(), { algorithms: ['HS256'] });
    } catch (err) {
        return {
            ok: false,
            status: 401,
            message: err.name === 'TokenExpiredError' ? 'Preview token expired' : 'Invalid preview token',
        };
    }

    if (decoded.purpose !== PREVIEW_PURPOSE) {
        return { ok: false, status: 403, message: 'Wrong token purpose' };
    }
    if (!decoded.storeId || !decoded.tokenId) {
        return { ok: false, status: 403, message: 'Malformed preview token' };
    }

    const record = await redisGet(tokenKey(decoded.tokenId));
    if (!record) {
        return { ok: false, status: 401, message: 'Preview token revoked or expired' };
    }
    try {
        const parsed = JSON.parse(record);
        if (parsed.status === 'revoked') {
            return { ok: false, status: 401, message: 'Preview token revoked' };
        }
    } catch {
        // plain value ok
    }

    if (storeId && String(storeId) !== String(decoded.storeId)) {
        return { ok: false, status: 403, message: 'Preview token store mismatch' };
    }
    if (themeId && decoded.themeId && String(themeId) !== String(decoded.themeId)) {
        return { ok: false, status: 403, message: 'Preview token theme mismatch' };
    }

    return {
        ok: true,
        claims: {
            storeId: decoded.storeId,
            themeId: decoded.themeId || '',
            merchantId: decoded.merchantId,
            tokenId: decoded.tokenId,
            purpose: decoded.purpose,
            expiresAt: new Date((decoded.exp || 0) * 1000).toISOString(),
        },
    };
};

export const revokePreviewToken = async ({ token, tokenId, merchantId } = {}) => {
    let id = tokenId;
    if (!id && token) {
        try {
            const decoded = jwt.verify(String(token), PREVIEW_SECRET(), { algorithms: ['HS256'] });
            id = decoded.tokenId;
            if (merchantId && String(decoded.merchantId) !== String(merchantId)) {
                return { ok: false, status: 403, message: 'Cannot revoke another merchant token' };
            }
        } catch {
            return { ok: false, status: 401, message: 'Invalid token' };
        }
    }
    if (!id) return { ok: false, status: 400, message: 'token or tokenId required' };

    const existing = await redisGet(tokenKey(id));
    if (!existing) {
        return { ok: true, revoked: false, message: 'Token already expired or unknown' };
    }
    await redisDel(tokenKey(id));
    return { ok: true, revoked: true, tokenId: id };
};

/** Rate limit minting: max N tokens per merchant per window. */
export const checkPreviewTokenRateLimit = async (merchantId, { max = 30, windowSec = 600 } = {}) => {
    if (!merchantId) return { ok: false, status: 401, message: 'Unauthorized' };
    const n = await redisIncrWithTtl(rateKey(merchantId), windowSec);
    if (n > max) {
        return { ok: false, status: 429, message: 'Too many preview tokens. Try again later.' };
    }
    return { ok: true, remaining: Math.max(0, max - n) };
};

export const PREVIEW_TOKEN_PURPOSE = PREVIEW_PURPOSE;
export const PREVIEW_DEFAULT_TTL_SEC = DEFAULT_TTL_SEC;

export default {
    mintPreviewToken,
    verifyPreviewToken,
    revokePreviewToken,
    checkPreviewTokenRateLimit,
    PREVIEW_TOKEN_PURPOSE,
    PREVIEW_DEFAULT_TTL_SEC,
};
