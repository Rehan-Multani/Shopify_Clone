/**
 * Theme analytics + experiments + audit (Wave 5/6).
 */
import Store from '../models/Store.js';
import ThemeAnalyticsEvent from '../models/ThemeAnalyticsEvent.js';
import ThemeExperiment from '../models/ThemeExperiment.js';
import ThemeAuditEvent from '../models/ThemeAuditEvent.js';
import { getExperimentVariant } from '../utils/experimentAssignment.js';
import {
    canTransitionExperiment,
    validateExperimentVariants,
    EXPERIMENT_STATUSES,
} from '../utils/experimentLifecycle.js';
import { ALLOWED_THEME_EVENTS, stripSensitiveMeta } from '../utils/themeAnalyticsHelpers.js';
import { recordThemeAudit } from '../utils/themeAudit.js';
import { requireOwnedStore } from '../utils/storeAccess.js';

const ALLOWED_EVENTS = ALLOWED_THEME_EVENTS;
const stripSensitive = stripSensitiveMeta;

const normalizeStatus = (s) => (s === 'ended' ? 'completed' : s);

const assertStoreAccess = async (req, storeId) => {
    return requireOwnedStore(req, storeId, { select: '_id installedThemes merchantId' });
};

const emptyMetrics = () => ({
    visitors: 0,
    sessions: 0,
    productViews: 0,
    addToCart: 0,
    beginCheckout: 0,
    purchases: 0,
    revenue: 0,
    revenueKnown: false,
    avgLoadMs: null,
});

const applyEventCount = (bucket, eventType, count, avgLoadMs, revenueSum = 0) => {
    switch (eventType) {
        case 'page_view': bucket.visitors += count; break;
        case 'session_start': bucket.sessions += count; break;
        case 'product_view': bucket.productViews += count; break;
        case 'add_to_cart': bucket.addToCart += count; break;
        case 'begin_checkout': bucket.beginCheckout += count; break;
        case 'purchase':
            bucket.purchases += count;
            if (revenueSum) {
                bucket.revenue += revenueSum;
                bucket.revenueKnown = true;
            }
            break;
        case 'theme_load':
            if (avgLoadMs) bucket.avgLoadMs = Math.round(avgLoadMs);
            break;
        default: break;
    }
};

const finalizeMetrics = (t) => ({
    ...t,
    conversionRate: t.visitors > 0 ? Number(((t.purchases / t.visitors) * 100).toFixed(2)) : 0,
    averageOrderValue: t.purchases > 0 && t.revenueKnown
        ? Number((t.revenue / t.purchases).toFixed(2))
        : null,
    revenue: t.revenueKnown ? Number(t.revenue.toFixed(2)) : null,
    sessions: t.sessions || null,
});

export const trackThemeEvent = async (req, res) => {
    try {
        const storeId = req.body.storeId || req.headers['x-store-id'];
        const {
            themeId, themeVersion, eventType, meta, experimentId, variantKey, metrics,
            sessionKey, revenue, currency, orderId,
        } = req.body || {};

        if (!storeId) {
            return res.status(400).json({ success: false, message: 'storeId required' });
        }
        if (!ALLOWED_EVENTS.has(String(eventType))) {
            return res.status(400).json({ success: false, message: 'Invalid eventType' });
        }

        if (req.merchant) {
            const access = await assertStoreAccess(req, storeId);
            if (!access.ok) return res.status(access.status).json({ success: false, message: access.message });
        } else {
            const exists = await Store.exists({ _id: storeId });
            if (!exists) return res.status(404).json({ success: false, message: 'Store not found' });
        }

        // Idempotent purchase attribution by orderId
        if (eventType === 'purchase' && orderId) {
            const existing = await ThemeAnalyticsEvent.findOne({
                storeId,
                eventType: 'purchase',
                orderId: String(orderId).slice(0, 64),
            }).select('_id');
            if (existing) {
                return res.status(200).json({ success: true, deduped: true });
            }
        }

        const revenueNum = revenue == null || revenue === '' ? undefined : Number(revenue);
        await ThemeAnalyticsEvent.create({
            storeId,
            themeId: String(themeId || '').slice(0, 120),
            themeVersion: String(themeVersion || '').slice(0, 40),
            eventType,
            meta: stripSensitive(meta),
            experimentId: String(experimentId || '').slice(0, 64),
            variantKey: String(variantKey || '').slice(0, 16),
            sessionKey: String(sessionKey || '').slice(0, 64),
            revenue: Number.isFinite(revenueNum) ? revenueNum : undefined,
            currency: String(currency || '').slice(0, 8),
            orderId: String(orderId || '').slice(0, 64),
            metrics: metrics && typeof metrics === 'object' ? {
                themeLoadMs: Number(metrics.themeLoadMs) || undefined,
                firstRenderMs: Number(metrics.firstRenderMs) || undefined,
                sectionLoadMs: Number(metrics.sectionLoadMs) || undefined,
            } : undefined,
        });

        res.status(201).json({ success: true });
    } catch (error) {
        console.error('[ThemeAnalytics] track:', error.message);
        // Analytics must not cascade — client treats as best-effort
        res.status(500).json({ success: false, message: 'Analytics write failed' });
    }
};

/**
 * Best-effort anonymous consent audit beacon (Wave 8).
 * No PII. Non-blocking for storefront if this fails.
 * @route POST /api/themes/consent
 */
export const recordConsentBeacon = async (req, res) => {
    try {
        const storeId = req.body.storeId || req.headers['x-store-id'];
        const consent = String(req.body.consent || '').toLowerCase();
        const sessionKey = String(req.body.sessionKey || '').slice(0, 64);
        if (!storeId) {
            return res.status(400).json({ success: false, message: 'storeId required' });
        }
        if (!['granted', 'denied'].includes(consent)) {
            return res.status(400).json({ success: false, message: 'consent must be granted|denied' });
        }
        const exists = await Store.exists({ _id: storeId });
        if (!exists) return res.status(404).json({ success: false, message: 'Store not found' });

        await recordThemeAudit({
            storeId,
            actorId: sessionKey || 'anonymous',
            action: 'CONSENT_UPDATED',
            metadata: {
                consent,
                at: new Date().toISOString(),
                anonymous: true,
            },
        });
        res.status(204).end();
    } catch (error) {
        console.error('[ConsentBeacon]', error.message);
        res.status(204).end(); // never block client
    }
};

export const getThemeAnalyticsSummary = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'] || req.query.storeId;
        if (!req.merchant) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const access = await assertStoreAccess(req, storeId);
        if (!access.ok) return res.status(access.status).json({ success: false, message: access.message });

        const days = Math.min(90, Math.max(1, Number(req.query.days) || 30));
        const since = new Date(Date.now() - days * 86400000);
        const themeId = req.query.themeId || '';
        const themeVersion = req.query.themeVersion || '';

        const match = { storeId: storeId, createdAt: { $gte: since } };
        if (themeId) match.themeId = themeId;
        if (themeVersion) match.themeVersion = themeVersion;

        const rows = await ThemeAnalyticsEvent.aggregate([
            { $match: match },
            {
                $group: {
                    _id: { themeId: '$themeId', themeVersion: '$themeVersion', eventType: '$eventType' },
                    count: { $sum: 1 },
                    avgLoadMs: { $avg: '$metrics.themeLoadMs' },
                    revenueSum: { $sum: { $ifNull: ['$revenue', 0] } },
                    uniqueSessions: { $addToSet: '$sessionKey' },
                },
            },
        ]);

        const byTheme = {};
        for (const row of rows) {
            const key = `${row._id.themeId || 'unknown'}@${row._id.themeVersion || '-'}`;
            if (!byTheme[key]) {
                byTheme[key] = {
                    themeId: row._id.themeId,
                    themeVersion: row._id.themeVersion,
                    ...emptyMetrics(),
                    _sessionSet: new Set(),
                };
            }
            applyEventCount(byTheme[key], row._id.eventType, row.count, row.avgLoadMs, row.revenueSum);
            (row.uniqueSessions || []).forEach((s) => {
                if (s) byTheme[key]._sessionSet.add(s);
            });
        }

        const themes = Object.values(byTheme).map((t) => {
            const sessionCount = t._sessionSet.size;
            delete t._sessionSet;
            if (sessionCount > 0) t.sessions = sessionCount;
            const finalized = finalizeMetrics(t);
            return {
                ...finalized,
                funnel: {
                    visitors: finalized.visitors,
                    productViews: finalized.productViews,
                    addToCart: finalized.addToCart,
                    beginCheckout: finalized.beginCheckout,
                    purchases: finalized.purchases,
                    rates: {
                        viewRate: finalized.visitors > 0 ? Number(((finalized.productViews / finalized.visitors) * 100).toFixed(2)) : null,
                        cartRate: finalized.productViews > 0 ? Number(((finalized.addToCart / finalized.productViews) * 100).toFixed(2)) : null,
                        checkoutRate: finalized.addToCart > 0 ? Number(((finalized.beginCheckout / finalized.addToCart) * 100).toFixed(2)) : null,
                        purchaseRate: finalized.beginCheckout > 0 ? Number(((finalized.purchases / finalized.beginCheckout) * 100).toFixed(2)) : null,
                    },
                },
            };
        });

        res.json({ success: true, days, themes });
    } catch (error) {
        console.error('[ThemeAnalytics] summary:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

/** Compare two theme versions over the same date window. */
export const compareThemeVersions = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'] || req.query.storeId;
        if (!req.merchant) return res.status(401).json({ success: false, message: 'Unauthorized' });
        const access = await assertStoreAccess(req, storeId);
        if (!access.ok) return res.status(access.status).json({ success: false, message: access.message });

        const themeId = req.query.themeId || '';
        const versionA = req.query.versionA || '';
        const versionB = req.query.versionB || '';
        const days = Math.min(90, Math.max(1, Number(req.query.days) || 30));
        if (!themeId || !versionA || !versionB) {
            return res.status(400).json({ success: false, message: 'themeId, versionA, versionB required' });
        }

        const since = new Date(Date.now() - days * 86400000);
        const rows = await ThemeAnalyticsEvent.aggregate([
            {
                $match: {
                    storeId,
                    themeId,
                    themeVersion: { $in: [versionA, versionB] },
                    createdAt: { $gte: since },
                },
            },
            {
                $group: {
                    _id: { themeVersion: '$themeVersion', eventType: '$eventType' },
                    count: { $sum: 1 },
                },
            },
        ]);

        const build = (version) => {
            const m = { themeId, themeVersion: version, ...emptyMetrics() };
            for (const row of rows) {
                if (row._id.themeVersion !== version) continue;
                applyEventCount(m, row._id.eventType, row.count);
            }
            m.conversionRate = m.visitors > 0 ? Number(((m.purchases / m.visitors) * 100).toFixed(2)) : 0;
            return m;
        };

        res.json({
            success: true,
            days,
            themeId,
            a: build(versionA),
            b: build(versionB),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Assign experiment variant — client NEVER chooses variant.
 * @route POST /api/themes/experiments/assign
 */
export const assignExperimentVariant = async (req, res) => {
    try {
        const storeId = req.body.storeId || req.headers['x-store-id'];
        const { experimentId, visitorKey } = req.body || {};
        if (!storeId || !experimentId || !visitorKey) {
            return res.status(400).json({ success: false, message: 'storeId, experimentId, visitorKey required' });
        }
        // Reject client-supplied variant attempts
        if (req.body.variantKey || req.body.chosenVariant) {
            return res.status(400).json({ success: false, message: 'Client cannot choose variant' });
        }

        const experiment = await ThemeExperiment.findOne({ _id: experimentId, storeId });
        if (!experiment) {
            return res.status(404).json({ success: false, message: 'Experiment not found' });
        }

        // Promote scheduled → running when window opens
        const now = new Date();
        if (
            experiment.status === 'scheduled'
            && experiment.startAt
            && now >= new Date(experiment.startAt)
        ) {
            experiment.status = 'running';
            await experiment.save();
        }

        const result = await getExperimentVariant({
            experiment,
            visitorKey: String(visitorKey).slice(0, 64),
            now,
        });
        if (!result.ok) {
            return res.status(400).json({ success: false, message: result.message });
        }

        res.json({
            success: true,
            experimentId: result.experimentId,
            variantKey: result.variantKey,
            themeId: result.themeId,
            themeFolder: result.themeFolder,
            themeVersion: result.themeVersion,
            presentation: result.presentation,
        });
    } catch (error) {
        console.error('[ThemeExperiment] assign:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

/** Public: resolve active running experiment for store (optional query). */
export const getActiveExperiment = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'] || req.query.storeId;
        if (!storeId) return res.status(400).json({ success: false, message: 'storeId required' });
        const exists = await Store.exists({ _id: storeId });
        if (!exists) return res.status(404).json({ success: false, message: 'Store not found' });

        const now = new Date();
        const experiment = await ThemeExperiment.findOne({
            storeId,
            status: { $in: ['running', 'scheduled'] },
            $and: [
                { $or: [{ startAt: null }, { startAt: { $lte: now } }] },
                { $or: [{ endAt: null }, { endAt: { $gte: now } }] },
            ],
        }).sort({ updatedAt: -1 }).lean();

        if (!experiment) {
            return res.json({ success: true, data: null });
        }
        res.json({
            success: true,
            data: {
                _id: experiment._id,
                name: experiment.name,
                status: experiment.status,
                // do not expose weights/internals unnecessarily
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const listExperiments = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        if (!req.merchant) return res.status(401).json({ success: false, message: 'Unauthorized' });
        const access = await assertStoreAccess(req, storeId);
        if (!access.ok) return res.status(access.status).json({ success: false, message: access.message });

        const list = await ThemeExperiment.find({ storeId }).sort({ updatedAt: -1 }).lean();
        res.json({
            success: true,
            data: list.map((e) => ({ ...e, status: normalizeStatus(e.status) })),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getExperiment = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        if (!req.merchant) return res.status(401).json({ success: false, message: 'Unauthorized' });
        const access = await assertStoreAccess(req, storeId);
        if (!access.ok) return res.status(access.status).json({ success: false, message: access.message });

        const experiment = await ThemeExperiment.findOne({ _id: req.params.id, storeId }).lean();
        if (!experiment) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data: { ...experiment, status: normalizeStatus(experiment.status) } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createExperiment = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        if (!req.merchant) return res.status(401).json({ success: false, message: 'Unauthorized' });
        if (req.previewAuth) {
            return res.status(403).json({ success: false, message: 'Preview is read-only' });
        }
        const access = await assertStoreAccess(req, storeId);
        if (!access.ok) return res.status(access.status).json({ success: false, message: access.message });

        const store = await Store.findById(storeId).select('installedThemes');
        const { name, variants, status, startAt, endAt } = req.body || {};
        if (!name) {
            return res.status(400).json({ success: false, message: 'name required' });
        }
        const validation = validateExperimentVariants(variants, {
            installedThemes: store?.installedThemes || [],
        });
        if (!validation.ok) {
            return res.status(400).json({ success: false, message: validation.message });
        }
        if (startAt && endAt && new Date(endAt) <= new Date(startAt)) {
            return res.status(400).json({ success: false, message: 'endAt must be after startAt' });
        }

        let nextStatus = 'draft';
        if (status && EXPERIMENT_STATUSES.includes(status) && status !== 'completed' && status !== 'cancelled') {
            nextStatus = status;
        }
        if (nextStatus === 'scheduled' && !startAt) {
            return res.status(400).json({ success: false, message: 'scheduled requires startAt' });
        }

        const doc = await ThemeExperiment.create({
            storeId,
            name: String(name).slice(0, 120),
            variants: variants.map((v) => ({
                key: String(v.key || '').slice(0, 8),
                themeId: String(v.themeId || ''),
                themeFolder: String(v.themeFolder || ''),
                themeVersion: String(v.themeVersion || ''),
                weight: Number(v.weight) || 0,
                label: String(v.label || '').slice(0, 40),
            })),
            status: nextStatus,
            startAt: startAt ? new Date(startAt) : undefined,
            endAt: endAt ? new Date(endAt) : undefined,
        });

        await recordThemeAudit({
            storeId,
            actorId: req.merchant._id,
            action: 'EXPERIMENT_CREATED',
            themeId: doc.variants[0]?.themeFolder || doc.variants[0]?.themeId || '',
            themeVersion: doc.variants[0]?.themeVersion || '',
            metadata: { experimentId: String(doc._id), name: doc.name },
        });

        res.status(201).json({ success: true, data: doc });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateExperiment = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        if (!req.merchant) return res.status(401).json({ success: false, message: 'Unauthorized' });
        if (req.previewAuth) return res.status(403).json({ success: false, message: 'Preview is read-only' });
        const access = await assertStoreAccess(req, storeId);
        if (!access.ok) return res.status(access.status).json({ success: false, message: access.message });

        const experiment = await ThemeExperiment.findOne({ _id: req.params.id, storeId });
        if (!experiment) return res.status(404).json({ success: false, message: 'Not found' });
        if (!['draft', 'scheduled', 'paused'].includes(normalizeStatus(experiment.status))) {
            return res.status(400).json({ success: false, message: 'Only draft/scheduled/paused experiments can be edited' });
        }

        const store = await Store.findById(storeId).select('installedThemes');
        const { name, variants, startAt, endAt } = req.body || {};
        if (name) experiment.name = String(name).slice(0, 120);
        if (variants) {
            const validation = validateExperimentVariants(variants, {
                installedThemes: store?.installedThemes || [],
            });
            if (!validation.ok) {
                return res.status(400).json({ success: false, message: validation.message });
            }
            experiment.variants = variants.map((v) => ({
                key: String(v.key || '').slice(0, 8),
                themeId: String(v.themeId || ''),
                themeFolder: String(v.themeFolder || ''),
                themeVersion: String(v.themeVersion || ''),
                weight: Number(v.weight) || 0,
                label: String(v.label || '').slice(0, 40),
            }));
        }
        if (startAt !== undefined) experiment.startAt = startAt ? new Date(startAt) : undefined;
        if (endAt !== undefined) experiment.endAt = endAt ? new Date(endAt) : undefined;
        await experiment.save();
        res.json({ success: true, data: experiment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const transitionExperiment = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        if (!req.merchant) return res.status(401).json({ success: false, message: 'Unauthorized' });
        if (req.previewAuth) return res.status(403).json({ success: false, message: 'Preview is read-only' });
        const access = await assertStoreAccess(req, storeId);
        if (!access.ok) return res.status(access.status).json({ success: false, message: access.message });

        const { status } = req.body || {};
        const target = normalizeStatus(status);
        if (!EXPERIMENT_STATUSES.includes(target)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const experiment = await ThemeExperiment.findOne({ _id: req.params.id, storeId });
        if (!experiment) return res.status(404).json({ success: false, message: 'Not found' });

        const from = normalizeStatus(experiment.status);
        if (!canTransitionExperiment(from, target)) {
            return res.status(400).json({
                success: false,
                message: `Invalid transition ${from} → ${target}`,
            });
        }

        experiment.status = target;
        if (target === 'running' && !experiment.startAt) experiment.startAt = new Date();
        if (target === 'completed' || target === 'cancelled') {
            experiment.endAt = experiment.endAt || new Date();
        }
        await experiment.save();

        const auditMap = {
            running: 'EXPERIMENT_STARTED',
            paused: 'EXPERIMENT_PAUSED',
            completed: 'EXPERIMENT_COMPLETED',
            cancelled: 'EXPERIMENT_CANCELLED',
        };
        if (auditMap[target]) {
            await recordThemeAudit({
                storeId,
                actorId: req.merchant._id,
                action: auditMap[target],
                metadata: { experimentId: String(experiment._id), name: experiment.name, from, to: target },
            });
        }

        res.json({ success: true, data: experiment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/** Per-variant results for an experiment. */
export const getExperimentResults = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        if (!req.merchant) return res.status(401).json({ success: false, message: 'Unauthorized' });
        const access = await assertStoreAccess(req, storeId);
        if (!access.ok) return res.status(access.status).json({ success: false, message: access.message });

        const experiment = await ThemeExperiment.findOne({ _id: req.params.id, storeId }).lean();
        if (!experiment) return res.status(404).json({ success: false, message: 'Not found' });

        const rows = await ThemeAnalyticsEvent.aggregate([
            {
                $match: {
                    storeId,
                    experimentId: String(experiment._id),
                },
            },
            {
                $group: {
                    _id: { variantKey: '$variantKey', eventType: '$eventType' },
                    count: { $sum: 1 },
                    revenueSum: { $sum: { $ifNull: ['$revenue', 0] } },
                    uniqueSessions: { $addToSet: '$sessionKey' },
                },
            },
        ]);

        const byVariant = {};
        for (const v of experiment.variants) {
            byVariant[v.key] = {
                variantKey: v.key,
                label: v.label || v.key,
                themeId: v.themeId,
                themeFolder: v.themeFolder,
                themeVersion: v.themeVersion,
                trafficPercent: v.weight,
                ...emptyMetrics(),
                _sessionSet: new Set(),
            };
        }

        for (const row of rows) {
            const key = row._id.variantKey || 'unknown';
            if (!byVariant[key]) {
                byVariant[key] = { variantKey: key, trafficPercent: null, ...emptyMetrics(), _sessionSet: new Set() };
            }
            applyEventCount(byVariant[key], row._id.eventType, row.count, null, row.revenueSum);
            (row.uniqueSessions || []).forEach((s) => {
                if (s) byVariant[key]._sessionSet.add(s);
            });
        }

        const variants = Object.values(byVariant).map((v) => {
            const sessionCount = v._sessionSet?.size || 0;
            delete v._sessionSet;
            if (sessionCount > 0) v.sessions = sessionCount;
            const finalized = finalizeMetrics(v);
            return {
                ...finalized,
                uniqueSessions: sessionCount > 0 ? sessionCount : null,
            };
        });

        const totals = variants.reduce((acc, v) => {
            acc.visitors += v.visitors || 0;
            acc.purchases += v.purchases || 0;
            acc.productViews += v.productViews || 0;
            acc.addToCart += v.addToCart || 0;
            acc.beginCheckout += v.beginCheckout || 0;
            acc.sessions += v.sessions || 0;
            if (v.revenue != null) {
                acc.revenue += v.revenue;
                acc.revenueKnown = true;
            }
            return acc;
        }, emptyMetrics());

        const totalsFinal = finalizeMetrics(totals);

        res.json({
            success: true,
            experiment: {
                _id: experiment._id,
                name: experiment.name,
                status: normalizeStatus(experiment.status),
                startAt: experiment.startAt,
                endAt: experiment.endAt,
            },
            variants,
            totals: {
                ...totalsFinal,
                uniqueSessions: totals.sessions || null,
            },
            note: 'Statistical significance is not calculated.',
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Apply winning experiment variant → DRAFT only (never auto-publish).
 * @route POST /api/themes/experiments/:id/apply-winner
 */
export const applyExperimentWinner = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        if (!req.merchant) return res.status(401).json({ success: false, message: 'Unauthorized' });
        if (req.previewAuth) return res.status(403).json({ success: false, message: 'Preview is read-only' });
        const access = await assertStoreAccess(req, storeId);
        if (!access.ok) return res.status(access.status).json({ success: false, message: access.message });

        const { variantKey } = req.body || {};
        if (!variantKey) {
            return res.status(400).json({ success: false, message: 'variantKey required' });
        }

        const experiment = await ThemeExperiment.findOne({ _id: req.params.id, storeId });
        if (!experiment) return res.status(404).json({ success: false, message: 'Experiment not found' });

        const variant = (experiment.variants || []).find((v) => String(v.key) === String(variantKey));
        if (!variant) {
            return res.status(400).json({ success: false, message: 'Variant not in experiment' });
        }

        const store = await Store.findById(storeId);
        if (!store) return res.status(404).json({ success: false, message: 'Store not found' });

        const themeIndex = store.installedThemes.findIndex((t) =>
            String(t.themeId) === String(variant.themeId)
            || String(t.folder) === String(variant.themeFolder)
            || String(t.folder) === String(variant.themeId)
        );
        if (themeIndex === -1) {
            return res.status(404).json({ success: false, message: 'Winning theme is not installed on this store' });
        }

        const install = store.installedThemes[themeIndex];
        // Prefer published snapshot as base, write into draft only
        const base = JSON.parse(JSON.stringify(
            install.publishedThemeSettings || install.draftThemeSettings || {}
        ));
        base.themeVersion = variant.themeVersion || base.themeVersion || install.version || '1.0.0';
        base.themeFolder = install.folder || variant.themeFolder || '';
        base.themeId = install.folder || variant.themeFolder || variant.themeId;

        store.installedThemes[themeIndex].draftThemeSettings = base;
        store.pendingTheme = {
            themeId: install.themeId,
            folder: install.folder,
            version: variant.themeVersion || install.version,
            mode: 'experiment-winner',
            preparedAt: new Date(),
        };
        store.markModified('installedThemes');
        store.markModified('pendingTheme');
        await store.save();

        await recordThemeAudit({
            storeId,
            actorId: req.merchant._id,
            action: 'EXPERIMENT_WINNER_APPLIED',
            themeId: install.folder || variant.themeId,
            themeVersion: variant.themeVersion || '',
            metadata: {
                experimentId: String(experiment._id),
                variantKey: variant.key,
                themeId: variant.themeId,
                themeFolder: variant.themeFolder,
                publishedUnchanged: true,
            },
        });

        res.json({
            success: true,
            message: 'Winner applied to draft. Review and publish when ready.',
            publishedUnchanged: true,
            pendingTheme: store.pendingTheme,
            draftThemeSettings: store.installedThemes[themeIndex].draftThemeSettings,
        });
    } catch (error) {
        console.error('[ThemeExperiment] applyWinner:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const listThemeAudit = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'] || req.query.storeId;
        if (!req.merchant) return res.status(401).json({ success: false, message: 'Unauthorized' });
        const access = await assertStoreAccess(req, storeId);
        if (!access.ok) return res.status(access.status).json({ success: false, message: access.message });

        const filter = { storeId };
        const group = req.query.filter || 'all';
        if (group === 'published') filter.action = 'THEME_PUBLISHED';
        else if (group === 'upgraded') filter.action = { $in: ['THEME_UPGRADED', 'THEME_MIGRATED'] };
        else if (group === 'rollback') filter.action = 'THEME_ROLLED_BACK';
        else if (group === 'experiments') filter.action = { $regex: /^EXPERIMENT_/ };

        const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
        const rows = await ThemeAuditEvent.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
        res.json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export default {
    trackThemeEvent,
    recordConsentBeacon,
    getThemeAnalyticsSummary,
    compareThemeVersions,
    assignExperimentVariant,
    getActiveExperiment,
    listExperiments,
    getExperiment,
    createExperiment,
    updateExperiment,
    transitionExperiment,
    getExperimentResults,
    applyExperimentWinner,
    listThemeAudit,
};
