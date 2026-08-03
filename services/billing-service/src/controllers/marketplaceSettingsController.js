import { SUPPORTED_GATEWAYS, PAYMENT_MODES, isSupportedGateway } from '../constants/gateways.js';
import { getOrCreateMarketplaceSettings, getPlatformAvailableGateways } from '../services/gatewayResolver.js';

function getMerchantId(req) {
    return req.merchant?._id || req.headers['x-merchant-id'];
}

// GET /marketplace/payment-settings
export const getMarketplacePaymentSettings = async (req, res) => {
    try {
        const merchantId = getMerchantId(req);
        if (!merchantId) return res.status(401).json({ message: 'Merchant authentication required' });

        const storeId = req.query.storeId || req.headers['x-store-id'] || null;
        const settings = await getOrCreateMarketplaceSettings(merchantId, storeId);
        const platformAvailable = await getPlatformAvailableGateways();

        res.json({
            merchantId: settings.merchantId,
            storeId: settings.storeId,
            allowVendorGateway: settings.allowVendorGateway,
            allowVendorGatewayFallback: settings.allowVendorGatewayFallback !== false,
            allowedVendorGateways: (settings.allowedVendorGateways || []).filter((g) => platformAvailable.includes(g)),
            paymentMode: settings.paymentMode,
            defaultGateway: settings.defaultGateway,
            splitPaymentEnabled: settings.splitPaymentEnabled,
            commissionPercent: settings.commissionPercent,
            updatedAt: settings.updatedAt,
            availableGateways: platformAvailable,
            platformAvailableGateways: platformAvailable,
            availablePaymentModes: PAYMENT_MODES
        });
    } catch (error) {
        console.error('getMarketplacePaymentSettings:', error);
        res.status(500).json({ message: error.message || 'Failed to load marketplace payment settings' });
    }
};

// PUT /marketplace/payment-settings
export const updateMarketplacePaymentSettings = async (req, res) => {
    try {
        const merchantId = getMerchantId(req);
        if (!merchantId) return res.status(401).json({ message: 'Merchant authentication required' });

        const storeId = req.body.storeId || req.headers['x-store-id'] || null;
        const settings = await getOrCreateMarketplaceSettings(merchantId, storeId);
        const platformAvailable = await getPlatformAvailableGateways();

        const {
            allowVendorGateway,
            allowVendorGatewayFallback,
            allowedVendorGateways,
            paymentMode,
            defaultGateway,
            splitPaymentEnabled,
            commissionPercent
        } = req.body;

        if (typeof allowVendorGateway === 'boolean') {
            settings.allowVendorGateway = allowVendorGateway;
            if (!allowVendorGateway) {
                settings.paymentMode = 'merchant';
            } else if (settings.paymentMode === 'merchant') {
                // Vendors configure their own accounts → payments go to vendor by default
                settings.paymentMode = 'vendor';
            }
        }

        if (typeof allowVendorGatewayFallback === 'boolean') {
            settings.allowVendorGatewayFallback = allowVendorGatewayFallback;
        }

        if (Array.isArray(allowedVendorGateways)) {
            settings.allowedVendorGateways = allowedVendorGateways
                .map((g) => String(g).toLowerCase())
                .filter((g) => isSupportedGateway(g) && platformAvailable.includes(g));
        }

        if (paymentMode && PAYMENT_MODES.includes(paymentMode)) {
            if (paymentMode !== 'merchant' && !settings.allowVendorGateway) {
                return res.status(400).json({
                    message: 'Enable "Allow Vendors to Configure Payment Gateways" before selecting vendor/split payment mode'
                });
            }
            settings.paymentMode = paymentMode;
            if (paymentMode === 'split') {
                settings.splitPaymentEnabled = true;
            }
        }

        if (defaultGateway === null || defaultGateway === '') {
            settings.defaultGateway = null;
        } else if (defaultGateway && isSupportedGateway(defaultGateway) && platformAvailable.includes(defaultGateway)) {
            settings.defaultGateway = String(defaultGateway).toLowerCase();
        }

        if (typeof splitPaymentEnabled === 'boolean') {
            settings.splitPaymentEnabled = splitPaymentEnabled;
        }

        if (commissionPercent !== undefined) {
            const n = Number(commissionPercent);
            if (Number.isNaN(n) || n < 0 || n > 100) {
                return res.status(400).json({ message: 'Commission percent must be between 0 and 100' });
            }
            settings.commissionPercent = n;
        }

        if (storeId) settings.storeId = storeId;
        await settings.save();

        res.json({
            message: 'Marketplace payment settings updated',
            settings: {
                merchantId: settings.merchantId,
                storeId: settings.storeId,
                allowVendorGateway: settings.allowVendorGateway,
                allowVendorGatewayFallback: settings.allowVendorGatewayFallback !== false,
                allowedVendorGateways: settings.allowedVendorGateways,
                paymentMode: settings.paymentMode,
                defaultGateway: settings.defaultGateway,
                splitPaymentEnabled: settings.splitPaymentEnabled,
                commissionPercent: settings.commissionPercent,
                updatedAt: settings.updatedAt
            }
        });
    } catch (error) {
        console.error('updateMarketplacePaymentSettings:', error);
        res.status(500).json({ message: error.message || 'Failed to update marketplace payment settings' });
    }
};
