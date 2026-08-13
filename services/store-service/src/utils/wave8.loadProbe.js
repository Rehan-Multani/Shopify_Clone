/**
 * Focused Wave 8 load probe — documents latency for local/staging hotspots.
 * Usage:
 *   BASE_URL=http://localhost:5000 node services/store-service/src/utils/wave8.loadProbe.js
 *
 * Assumptions: gateway reachable; public health + theme-store endpoints exist.
 * Does NOT invent production capacity numbers.
 */
const BASE = process.env.BASE_URL || 'http://localhost:5000';
const N = Number(process.env.LOAD_N || 30);

const endpoints = [
    { name: 'gateway_health', path: '/api/health' },
    { name: 'store_health', path: '/api/store/health' },
    { name: 'theme_store_public', path: '/api/theme-store' },
];

const percentile = (sorted, p) => {
    if (!sorted.length) return null;
    const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
    return sorted[idx];
};

const probe = async (url) => {
    const t0 = Date.now();
    let status = 0;
    let err = null;
    try {
        const res = await fetch(url);
        status = res.status;
        await res.text();
    } catch (e) {
        err = e.message;
    }
    return { ms: Date.now() - t0, status, err };
};

const run = async () => {
    const report = { base: BASE, n: N, assumptions: 'Single process local/staging; sequential requests', results: {} };
    for (const ep of endpoints) {
        const samples = [];
        let errors = 0;
        for (let i = 0; i < N; i += 1) {
            const r = await probe(`${BASE}${ep.path}`);
            samples.push(r.ms);
            if (r.err || r.status >= 500) errors += 1;
        }
        const sorted = [...samples].sort((a, b) => a - b);
        report.results[ep.name] = {
            p50: percentile(sorted, 50),
            p95: percentile(sorted, 95),
            p99: percentile(sorted, 99),
            errorRate: errors / N,
            samples: N,
        };
    }
    console.log(JSON.stringify(report, null, 2));
};

run().catch((e) => {
    console.error(e);
    process.exit(1);
});
