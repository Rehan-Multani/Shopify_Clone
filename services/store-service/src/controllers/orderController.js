import Order from '../models/Order.js';
import Store from '../models/Store.js';

// @desc    Get all orders for the merchant
// @route   GET /api/orders
// @access  Private/Merchant
export const getMyOrders = async (req, res) => {
    try {
        const merchantId = req.merchant._id;
        const { storeId } = req.query;

        const filter = { merchantId };
        if (storeId) {
            filter.storeId = storeId;
        }

        const orders = await Order.find(filter).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createOrder = async (req, res) => {
    try {
        const { 
            customerName, 
            customerEmail, 
            customerPhone,
            customerId,
            paymentMethod,
            shippingAddress,
            products, 
            totalAmount, 
            status, 
            paymentStatus, 
            storeId, 
            subtotal, 
            gstAmount, 
            platformCommissionAmount 
        } = req.body;

        if (!customerName) {
            return res.status(400).json({ message: 'Customer name is required' });
        }

        if (!products || products.length === 0) {
            return res.status(400).json({ message: 'At least one product is required' });
        }

        // Determine storeId and merchantId
        let finalStoreId = storeId;
        let finalMerchantId = req.merchant?._id;

        if (finalStoreId) {
            const store = await Store.findById(finalStoreId);
            if (!store) {
                return res.status(400).json({ message: 'Store not found.' });
            }
            finalMerchantId = store.merchantId;
        } else if (finalMerchantId) {
            const store = await Store.findOne({ merchantId: finalMerchantId });
            if (!store) {
                return res.status(400).json({ message: 'No store found for this merchant. Please create a store first.' });
            }
            finalStoreId = store._id;
        } else {
            return res.status(400).json({ message: 'storeId or merchant authentication is required' });
        }

        const computedSubtotal = subtotal || products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
        const finalGst = gstAmount || 0;
        const finalCommission = platformCommissionAmount || 0;

        const initialTrackingStatus = [
            {
                status: 'pending',
                updatedAt: new Date(),
                description: 'Order placed successfully. Waiting for store acceptance.'
            }
        ];

        const order = await Order.create({
            merchantId: finalMerchantId,
            storeId: finalStoreId,
            customerName,
            customerEmail: customerEmail || '',
            customerPhone: customerPhone || '',
            customerId: customerId || null,
            paymentMethod: paymentMethod || 'COD',
            shippingAddress: shippingAddress || { address: '', city: '', state: '', pincode: '' },
            products,
            subtotal: computedSubtotal,
            gstAmount: finalGst,
            platformCommissionAmount: finalCommission,
            totalAmount: totalAmount || (computedSubtotal + finalGst + finalCommission),
            status: status || 'pending',
            paymentStatus: paymentStatus || 'pending',
            trackingStatus: initialTrackingStatus
        });

        // Increment totalOrders and revenue on the Store
        await Store.findByIdAndUpdate(finalStoreId, {
            $inc: { 
                totalOrders: 1,
                revenue: order.paymentStatus === 'paid' ? order.totalAmount : 0
            }
        });

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private/Merchant
export const updateOrderStatus = async (req, res) => {
    try {
        const merchantId = req.merchant._id;
        const { status, paymentStatus, trackingDescription } = req.body;

        const order = await Order.findOne({ _id: req.params.id, merchantId });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const prevPaymentStatus = order.paymentStatus;
        const prevStatus = order.status;

        if (status !== undefined) order.status = status;
        if (paymentStatus !== undefined) order.paymentStatus = paymentStatus;

        // If status changed, push to tracking timeline
        if (status !== undefined && status !== prevStatus) {
            let desc = trackingDescription || `Order status updated to ${status}.`;
            if (status === 'accepted') desc = trackingDescription || 'Store has accepted your order and is preparing it.';
            if (status === 'shipped') desc = trackingDescription || 'Order has been shipped and is in transit.';
            if (status === 'out_for_delivery') desc = trackingDescription || 'Order is out for delivery. Our delivery executive will reach you soon.';
            if (status === 'delivered') desc = trackingDescription || 'Order delivered successfully. Thank you for shopping!';
            if (status === 'completed') desc = trackingDescription || 'Order delivered successfully. Thank you for shopping!';
            if (status === 'cancelled') desc = trackingDescription || 'Order has been cancelled.';
            if (status === 'rejected') desc = trackingDescription || 'Order rejected by store.';

            order.trackingStatus.push({
                status,
                updatedAt: new Date(),
                description: desc
            });
        }

        const updatedOrder = await order.save();

        // If payment status changed to paid, update store revenue
        if (prevPaymentStatus !== 'paid' && updatedOrder.paymentStatus === 'paid') {
            await Store.findByIdAndUpdate(order.storeId, {
                $inc: { revenue: order.totalAmount }
            });
        }

        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get orders for a customer
// @route   GET /api/orders/customer/:customerId
// @access  Public
export const getCustomerOrders = async (req, res) => {
    try {
        const { customerId } = req.params;
        const orders = await Order.find({ customerId }).sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get order details (for tracking)
// @route   GET /api/orders/:id
// @access  Public
export const getOrderDetails = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel order by customer
// @route   PUT /api/orders/:id/cancel
// @access  Public
export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Check if order status prevents cancellation
        if (order.status === 'out_for_delivery' || order.status === 'delivered') {
            return res.status(400).json({ 
                success: false, 
                message: 'Order cannot be cancelled once it is out for delivery or delivered.' 
            });
        }

        if (order.status === 'cancelled') {
            return res.status(400).json({ success: false, message: 'Order is already cancelled.' });
        }

        if (order.status === 'rejected') {
            return res.status(400).json({ success: false, message: 'Order is already rejected.' });
        }

        order.status = 'cancelled';
        order.trackingStatus.push({
            status: 'cancelled',
            updatedAt: new Date(),
            description: 'Order cancelled by customer.'
        });

        const updatedOrder = await order.save();
        res.json({ success: true, order: updatedOrder });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
