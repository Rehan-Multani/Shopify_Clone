/**
 * Lightweight Redis helper for billing/auth/catalog (optional ioredis).
 * Falls back to process memory when REDIS_URL is missing or Redis is down.
 */
const memoryCounters = new Map();
const memoryLists = new Map();

let redis = null;
let backend = 'memory';
let initPromise = null;

const isProductionEnv = () => {
    const env = String(process.env.NODE_ENV || 'development').toLowerCase();
    return env === 'production' || process.env.REQUIRE_REDIS === 'true';
};

const pruneCounters = () => {
    const now = Date.now();
    for (const [k, v] of memoryCounters.entries()) {
        if (v.expiresAtMs && v.expiresAtMs <= now) memoryCounters.delete(k);
    }
};

export async function initSharedRedis() {
    if (initPromise) return initPromise;
    initPromise = (async () => {
        const url = process.env.REDIS_URL || process.env.REDIS_URI || '';
        if (!url) {
            backend = 'memory';
            return null;
        }
        try {
            const { default: Redis } = await import('ioredis');
            redis = new Redis(url, {
                maxRetriesPerRequest: 1,
                enableReadyCheck: true,
                lazyConnect: true,
            });
            redis.on('error', (err) => {
                console.warn('[shared-redis]', err.message);
            });
            await redis.connect();
            backend = 'redis';
            return redis;
        } catch (err) {
            console.warn('[shared-redis] unavailable:', err.message);
            redis = null;
            backend = 'memory';
            return null;
        }
    })();
    return initPromise;
}

export function getSharedRedisBackend() {
    return redis && backend === 'redis' ? 'redis' : 'memory';
}

export async function redisIncrWithTtl(key, ttlSec = 900) {
    await initSharedRedis();
    const ttl = Math.max(1, Number(ttlSec) || 900);
    if (redis && getSharedRedisBackend() === 'redis') {
        try {
            const n = await redis.incr(key);
            if (n === 1) await redis.expire(key, ttl);
            return n;
        } catch (err) {
            console.warn('[shared-redis] incr failed:', err.message);
            if (isProductionEnv()) throw err;
        }
    }
    pruneCounters();
    const now = Date.now();
    const row = memoryCounters.get(key);
    if (!row || row.expiresAtMs <= now) {
        memoryCounters.set(key, { count: 1, expiresAtMs: now + ttl * 1000 });
        return 1;
    }
    row.count += 1;
    return row.count;
}

const QUEUE_KEY = 'storify:email:tx:queue';

export async function redisQueuePush(payload) {
    await initSharedRedis();
    const raw = JSON.stringify(payload);
    if (redis && getSharedRedisBackend() === 'redis') {
        try {
            await redis.rpush(QUEUE_KEY, raw);
            return { backend: 'redis' };
        } catch (err) {
            console.warn('[shared-redis] rpush failed:', err.message);
        }
    }
    const list = memoryLists.get(QUEUE_KEY) || [];
    list.push(raw);
    memoryLists.set(QUEUE_KEY, list);
    return { backend: 'memory' };
}

export async function redisQueuePop() {
    await initSharedRedis();
    if (redis && getSharedRedisBackend() === 'redis') {
        try {
            const raw = await redis.lpop(QUEUE_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (err) {
            console.warn('[shared-redis] lpop failed:', err.message);
            return null;
        }
    }
    const list = memoryLists.get(QUEUE_KEY) || [];
    if (!list.length) return null;
    const raw = list.shift();
    memoryLists.set(QUEUE_KEY, list);
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

export { isProductionEnv };
