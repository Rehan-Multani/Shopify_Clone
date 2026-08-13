import mongoose from 'mongoose';

const themeAnalyticsEventSchema = new mongoose.Schema({
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Store',
        required: true,
        index: true,
    },
    themeId: { type: String, default: '', index: true },
    themeVersion: { type: String, default: '' },
    eventType: {
        type: String,
        required: true,
        enum: [
            'page_view',
            'product_view',
            'add_to_cart',
            'begin_checkout',
            'purchase',
            'theme_preview',
            'theme_published',
            'theme_upgraded',
            'theme_load',
            'session_start',
        ],
        index: true,
    },
    meta: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    experimentId: { type: String, default: '' },
    variantKey: { type: String, default: '' },
    // Anonymous first-party session (no PII)
    sessionKey: { type: String, default: '', index: true, maxlength: 64 },
    // Purchase attribution
    revenue: { type: Number, default: undefined },
    currency: { type: String, default: '', maxlength: 8 },
    orderId: { type: String, default: '', maxlength: 64 },
    metrics: {
        themeLoadMs: Number,
        firstRenderMs: Number,
        sectionLoadMs: Number,
    },
}, {
    timestamps: { createdAt: true, updatedAt: false },
});

themeAnalyticsEventSchema.index({ storeId: 1, createdAt: -1 });
themeAnalyticsEventSchema.index({ storeId: 1, themeId: 1, eventType: 1 });
themeAnalyticsEventSchema.index({ storeId: 1, experimentId: 1, variantKey: 1 });
themeAnalyticsEventSchema.index({ storeId: 1, sessionKey: 1, eventType: 1 });
// Purchase attribution idempotency (sparse: only purchase rows with orderId)
themeAnalyticsEventSchema.index(
    { storeId: 1, eventType: 1, orderId: 1 },
    {
        unique: true,
        partialFilterExpression: {
            eventType: 'purchase',
            orderId: { $type: 'string', $gt: '' },
        },
    }
);

const ThemeAnalyticsEvent = mongoose.model('ThemeAnalyticsEvent', themeAnalyticsEventSchema);
export default ThemeAnalyticsEvent;
