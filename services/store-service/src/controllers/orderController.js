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

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private/Merchant
export const createOrder = async (req, res) => {
    try {
        const merchantId = req.merchant._id;
        const { customerName, customerEmail, products, totalAmount, status, paymentStatus, storeId } = req.body;

        if (!customerName) {
            return res.status(400).json({ message: 'Customer name is required' });
        }

        if (!products || products.length === 0) {
            return res.status(400).json({ message: 'At least one product is required' });
        }

        // Determine storeId
        let finalStoreId = storeId;
        if (!finalStoreId) {
            const store = await Store.findOne({ merchantId });
            if (!store) {
                return res.status(400).json({ message: 'No store found for this merchant. Please create a store first.' });
            }
            finalStoreId = store._id;
        }

        const order = await Order.create({
            merchantId,
            storeId: finalStoreId,
            customerName,
            customerEmail: customerEmail || '',
            products,
            totalAmount: totalAmount || products.reduce((sum, p) => sum + (p.price * p.quantity), 0),
            status: status || 'pending',
            paymentStatus: paymentStatus || 'pending'
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
        const { status, paymentStatus } = req.body;

        const order = await Order.findOne({ _id: req.params.id, merchantId });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const prevPaymentStatus = order.paymentStatus;

        if (status !== undefined) order.status = status;
        if (paymentStatus !== undefined) order.paymentStatus = paymentStatus;

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
