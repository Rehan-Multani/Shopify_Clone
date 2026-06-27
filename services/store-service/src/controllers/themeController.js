import Theme from '../models/Theme.js';
import Store from '../models/Store.js';

// @desc    Get store theme settings
// @route   GET /api/themes
// @access  Private (Merchant)
export const getTheme = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ success: false, message: 'Store ID (x-store-id) is required' });
        }

        // Find or create theme
        let theme = await Theme.findOne({ storeId });
        if (!theme) {
            let merchantId = req.merchant ? req.merchant._id : undefined;
            if (!merchantId) {
                const store = await Store.findById(storeId);
                if (store) merchantId = store.merchantId;
            }
            theme = await Theme.create({ storeId, merchantId });
        } else if (!theme.merchantId) {
            let merchantId = req.merchant ? req.merchant._id : undefined;
            if (!merchantId) {
                const store = await Store.findById(storeId);
                if (store) merchantId = store.merchantId;
            }
            if (merchantId) {
                theme.merchantId = merchantId;
                await theme.save();
            }
        }

        res.status(200).json({
            success: true,
            theme
        });
    } catch (error) {
        console.error('Error fetching theme:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update or create store theme settings
// @route   PUT /api/themes
// @access  Private (Merchant)
export const updateTheme = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ success: false, message: 'Store ID (x-store-id) is required' });
        }

        const updateData = { ...req.body };
        delete updateData.storeId; // Prevent changing storeId

        // Make sure merchantId is set
        let merchantId = req.merchant ? req.merchant._id : undefined;
        if (!merchantId) {
            const store = await Store.findById(storeId);
            if (store) merchantId = store.merchantId;
        }
        if (merchantId) {
            updateData.merchantId = merchantId;
        }

        const theme = await Theme.findOneAndUpdate(
            { storeId },
            { $set: updateData },
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Theme updated successfully',
            theme
        });
    } catch (error) {
        console.error('Error updating theme:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Reset store theme to default settings
// @route   DELETE /api/themes
// @access  Private (Merchant)
export const resetTheme = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ success: false, message: 'Store ID (x-store-id) is required' });
        }

        await Theme.findOneAndDelete({ storeId });

        let merchantId = req.merchant ? req.merchant._id : undefined;
        if (!merchantId) {
            const store = await Store.findById(storeId);
            if (store) merchantId = store.merchantId;
        }

        // Create new default one
        const theme = await Theme.create({ storeId, merchantId });

        res.status(200).json({
            success: true,
            message: 'Theme reset to defaults successfully',
            theme
        });
    } catch (error) {
        console.error('Error resetting theme:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
