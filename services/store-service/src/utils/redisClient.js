/**
 * Shared Redis client for store-service.
 * Production: REDIS_URL required for preview-token / distributed state.
 * Development: memory TTL fallback allowed.
 */
import './loadEnv.js';
import Redis from 'ioredis';

const memory = new Map();

const pruneMemory = () => {
    const now = Date.now();
    for (const [k, v] of memory.entries()) {
        if (v.expiresAtMs && v.expiresAtMs <= now) memory.delete(k);
    }
};

let redis = null;
let backend = 'memory';
let initError = null;

export const isProductionEnv = () => {
    const env = String(process.env.NODE_ENV || 'development').toLowerCase();
    return env === 'production' || process.env.REQUIRE_REDIS === 'true';
};

export const initRedis = () => {
    const url = process.env.REDIS_URL || process.env.REDIS_URI || '';
    if (!url) {
        backend = 'memory';
        if (isProductionEnv()) {
            initError = 'REDIS_URL is required in production';
            console.error('[redis]', initError);
        }
        return null;
    }
    try {
        redis = new Redis(url, {
            maxRetriesPerRequest: null, // required by BullMQ
            enableReadyCheck: true,
            lazyConnect: true,
        });
        redis.on('error', (err) => {
            console.warn('[redis] error:', err.message);
            if (isProductionEnv()) {
                backend = 'redis-error';
            }
        });
        backend = 'redis';
        initError = null;
        redis.connect().catch((err) => {
            console.warn('[redis] connect failed:', err.message);
            if (isProductionEnv()) {
                backend = 'redis-error';
                initError = err.message;
            } else {
                backend = 'memory';
                redis = null;
            }
        });
        return redis;
    } catch (err) {
        console.warn('[redis] init failed:', err.message);
        if (isProductionEnv()) {
            backend = 'redis-error';
            initError = err.message;
        } else {
            backend = 'memory';
            redis = null;
        }
        return null;
    }
};

export const getRedisClient = () => redis;

export const getRedisBackend = () => {
    if (redis && backend === 'redis') return 'redis';
    if (backend === 'redis-error') return 'redis-error';
    return 'memory';
};

/** Preview tokens: production must use Redis. */
export const assertPreviewTokenBackend = () => {
    if (!isProductionEnv()) {
        return { ok: true, backend: getRedisBackend() };
    }
    if (!process.env.REDIS_URL && !process.env.REDIS_URI) {
        return {
            ok: false,
            status: 503,
            message: 'REDIS_URL is required for preview tokens in production',
        };
    }
    if (getRedisBackend() !== 'redis') {
        return {
            ok: false,
            status: 503,
            message: initError || 'Redis unavailable — preview tokens cannot use process memory in production',
        };
    }
    return { ok: true, backend: 'redis' };
};

export const redisSetEx = async (key, ttlSec, value) => {
    const ttl = Math.max(1, Number(ttlSec) || 1);
    const str = String(value);
    if (redis && getRedisBackend() === 'redis') {
        try {
            await redis.setex(key, ttl, str);
            return true;
        } catch (err) {
            console.warn('[redis] setex failed:', err.message);
            if (isProductionEnv()) throw err;
        }
    }
    if (isProductionEnv()) {
        throw new Error('Redis required for preview token state in production');
    }
    pruneMemory();
    memory.set(key, { value: str, expiresAtMs: Date.now() + ttl * 1000 });
    return true;
};

export const redisGet = async (key) => {
    if (redis && getRedisBackend() === 'redis') {
        try {
            const v = await redis.get(key);
            if (v != null) return v;
        } catch (err) {
            console.warn('[redis] get failed:', err.message);
            if (isProductionEnv()) throw err;
        }
    }
    if (isProductionEnv() && getRedisBackend() !== 'redis') {
        throw new Error('Redis required for preview token state in production');
    }
    pruneMemory();
    const row = memory.get(key);
    if (!row) return null;
    if (row.expiresAtMs && row.expiresAtMs <= Date.now()) {
        memory.delete(key);
        return null;
    }
    return row.value;
};

export const redisDel = async (key) => {
    if (redis && getRedisBackend() === 'redis') {
        try {
            await redis.del(key);
        } catch (err) {
            console.warn('[redis] del failed:', err.message);
            if (isProductionEnv()) throw err;
        }
    }
    memory.delete(key);
    return true;
};

export const redisIncrWithTtl = async (key, ttlSec) => {
    const ttl = Math.max(1, Number(ttlSec) || 60);
    if (redis && getRedisBackend() === 'redis') {
        try {
            const n = await redis.incr(key);
            if (n === 1) await redis.expire(key, ttl);
            return n;
        } catch (err) {
            console.warn('[redis] incr failed:', err.message);
            if (isProductionEnv()) throw err;
        }
    }
    pruneMemory();
    const row = memory.get(key);
    const now = Date.now();
    if (!row || (row.expiresAtMs && row.expiresAtMs <= now)) {
        memory.set(key, { value: '1', expiresAtMs: now + ttl * 1000 });
        return 1;
    }
    const next = String(Number(row.value || 0) + 1);
    memory.set(key, { value: next, expiresAtMs: row.expiresAtMs });
    return Number(next);
};

initRedis();

export default {
    initRedis,
    getRedisClient,
    getRedisBackend,
    assertPreviewTokenBackend,
    isProductionEnv,
    redisSetEx,
    redisGet,
    redisDel,
    redisIncrWithTtl,
};
