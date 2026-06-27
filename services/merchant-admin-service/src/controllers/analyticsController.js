import Subscription from '../models/Subscription.js';
import Plan from '../models/Plan.js';
import Store from '../models/Store.js';
import Merchant from '../models/Merchant.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Customer from '../models/Customer.js';
import SupportTicket from '../models/SupportTicket.js';

// @desc    Get detailed platform-wide analytics stats for Superadmin
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getSuperadminAnalytics = async (req, res) => {
    try {
        // 1. Fetch Subscription details
        const activeSubs = await Subscription.find({ status: 'active' }).populate('plan');
        const mrr = activeSubs.reduce((acc, sub) => acc + (sub.amount || sub.plan?.planPrice || 0), 0);
        const arr = mrr * 12;

        // 2. Fetch GMV & Orders (Store Service database)
        const paidOrders = await Order.find({ paymentStatus: 'paid' });
        const gmv = paidOrders.reduce((acc, ord) => acc + (ord.totalAmount || 0), 0);
        const totalOrders = await Order.countDocuments();
        
        // Transaction Fee Revenue (1% commission)
        const transactionFeeRevenue = gmv * 0.01;

        // 3. Fetch Store count & status
        const totalStoresCount = await Store.countDocuments();
        const activeStoresCount = await Store.countDocuments({ isActive: true });
        const inactiveStoresCount = await Store.countDocuments({ isActive: false });
        const totalMerchantsCount = await Merchant.countDocuments();
        
        // ARPU (Average Revenue Per User)
        const totalRevenue = mrr + transactionFeeRevenue;
        const arpu = activeStoresCount > 0 ? Math.round(totalRevenue / activeStoresCount) : 0;

        // Churn Rate
        const churnRate = totalStoresCount > 0 ? Number(((inactiveStoresCount / totalStoresCount) * 100).toFixed(1)) : 0;

        // 4. Plan Distribution breakdown
        const planCounts = {
            'Trial': 0,
            'Basic': 0,
            'Advanced': 0,
            'Enterprise': 0
        };

        const subscribedStoreIds = activeSubs.map(sub => sub.store.toString());
        
        activeSubs.forEach(sub => {
            const planName = sub.plan?.planName || 'Starter';
            const nameLower = planName.toLowerCase();
            if (nameLower.includes('enterprise') || nameLower.includes('plus') || nameLower.includes('multi')) {
                planCounts['Enterprise']++;
            } else if (nameLower.includes('advanced')) {
                planCounts['Advanced']++;
            } else if (nameLower.includes('basic') || nameLower.includes('starter') || nameLower.includes('single')) {
                planCounts['Basic']++;
            } else {
                planCounts['Trial']++;
            }
        });

        // Stores without active subscriptions are in Trial
        const allStores = await Store.find();
        allStores.forEach(st => {
            if (!subscribedStoreIds.includes(st._id.toString())) {
                planCounts['Trial']++;
            }
        });

        // Dynamic plan list with purchase counts grouped by Single Vendor and Multi Vendor
        const allPlans = await Plan.find({});
        
        const planPurchaseCounts = {};
        allPlans.forEach(p => {
            planPurchaseCounts[p._id.toString()] = 0;
        });

        activeSubs.forEach(sub => {
            if (sub.plan && sub.plan._id) {
                const planId = sub.plan._id.toString();
                if (planPurchaseCounts[planId] !== undefined) {
                    planPurchaseCounts[planId]++;
                }
            }
        });

        const singleVendorPlans = [];
        const multiVendorPlans = [];

        allPlans.forEach(plan => {
            const formatted = {
                id: plan._id,
                planName: plan.planName,
                planPrice: plan.planPrice,
                planType: plan.planType,
                purchaseCount: planPurchaseCounts[plan._id.toString()] || 0
            };

            if (plan.planType === 'Multi Vendor') {
                multiVendorPlans.push(formatted);
            } else {
                singleVendorPlans.push(formatted);
            }
        });

        // 5. System Usage metrics
        const totalProducts = await Product.countDocuments();
        const totalBuyers = await Customer.countDocuments();
        const apiTraffic = (totalStoresCount * 1250) + (totalOrders * 15);

        // 6. Recent Registrations
        const recentStores = await Store.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('merchantId');

        const recentRegistrations = [];
        for (const store of recentStores) {
            const sub = await Subscription.findOne({ store: store._id, status: 'active' }).populate('plan');
            recentRegistrations.push({
                name: store.storeName,
                owner: store.merchantId?.name || 'Unknown',
                email: store.merchantId?.email || 'N/A',
                plan: sub?.plan?.planName || 'Trial',
                joined: store.createdAt
            });
        }

        res.status(200).json({
            success: true,
            data: {
                financials: {
                    mrr,
                    arr,
                    gmv,
                    transactionFeeRevenue,
                    arpu
                },
                merchantMetrics: {
                    totalStores: totalStoresCount,
                    activeStores: activeStoresCount,
                    totalMerchants: totalMerchantsCount,
                    totalPlans: allPlans.length,
                    churnRate,
                    planCounts
                },
                ecosystemMetrics: {
                    gmv,
                    totalOrders,
                    aov: totalOrders > 0 ? Math.round(gmv / totalOrders) : 0
                },
                systemUsage: {
                    totalProducts,
                    totalBuyers,
                    apiTraffic
                },
                recentRegistrations,
                singleVendorPlans,
                multiVendorPlans
            }
        });
    } catch (error) {
        console.error('Error fetching superadmin analytics:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get platform-wide overview stats for Superadmin
// @route   GET /api/admin/overview
// @access  Private/Admin
export const getSuperadminOverview = async (req, res) => {
    try {
        // 1. Fetch live metrics
        const activeSubs = await Subscription.find({ status: 'active' }).populate('plan');
        const mrr = activeSubs.reduce((acc, sub) => acc + (sub.amount || sub.plan?.planPrice || 0), 0);

        const totalStoresCount = await Store.countDocuments({});
        const activeStoresCount = await Store.countDocuments({ isActive: true });
        
        const totalMerchantsCount = await Merchant.countDocuments({});
        
        const prev30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const prev60d = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
        
        const newSignups30d = await Merchant.countDocuments({ createdAt: { $gte: prev30d } });
        const newSignupsPrior = await Merchant.countDocuments({ createdAt: { $gte: prev60d, $lt: prev30d } }) || 1;
        const newSignupsChange = Math.round(((newSignups30d - newSignupsPrior) / newSignupsPrior) * 100);

        // 2. Fetch Support tickets
        const openTickets = await SupportTicket.countDocuments({ status: { $in: ['open', 'in-progress'] } });

        // 2. Fetch Support tickets, Custom Domains and Paying stores
        const customDomainsCount = await Store.countDocuments({ customDomain: { $exists: true, $ne: '' } });
        const activePaidSubscriptionsCount = await Subscription.countDocuments({ status: 'active' });

        // 3. Last 7 Days Revenue Trend (Platform GMV)
        const dailyRevenue = [];
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let i = 6; i >= 0; i--) {
            const start = new Date();
            start.setHours(0, 0, 0, 0);
            start.setDate(start.getDate() - i);

            const end = new Date();
            end.setHours(23, 59, 59, 999);
            end.setDate(end.getDate() - i);

            const orders = await Order.find({
                paymentStatus: 'paid',
                createdAt: { $gte: start, $lte: end }
            });
            const val = orders.reduce((acc, ord) => acc + (ord.totalAmount || 0), 0);
            dailyRevenue.push({
                day: daysOfWeek[start.getDay()],
                val: Math.round(val / 1000) // in Thousands
            });
        }

        // 4. Plan Distribution breakdown
        const planCounts = {
            'Trial': 0,
            'Basic': 0,
            'Advanced': 0,
            'Enterprise': 0
        };
        const subscribedStoreIds = activeSubs.map(sub => sub.store.toString());
        
        activeSubs.forEach(sub => {
            const planName = sub.plan?.planName || 'Starter';
            const nameLower = planName.toLowerCase();
            if (nameLower.includes('enterprise') || nameLower.includes('plus') || nameLower.includes('multi')) {
                planCounts['Enterprise']++;
            } else if (nameLower.includes('advanced')) {
                planCounts['Advanced']++;
            } else if (nameLower.includes('basic') || nameLower.includes('starter') || nameLower.includes('single')) {
                planCounts['Basic']++;
            } else {
                planCounts['Trial']++;
            }
        });

        const allStores = await Store.find({});
        allStores.forEach(st => {
            if (!subscribedStoreIds.includes(st._id.toString())) {
                planCounts['Trial']++;
            }
        });

        const totalStores = allStores.length || 1;
        const planDist = [
            { name: 'Enterprise', count: planCounts['Enterprise'], pct: Math.round((planCounts['Enterprise'] / totalStores) * 100), color: '#8B5CF6' },
            { name: 'Advanced', count: planCounts['Advanced'], pct: Math.round((planCounts['Advanced'] / totalStores) * 100), color: '#14B8A6' },
            { name: 'Basic', count: planCounts['Basic'], pct: Math.round((planCounts['Basic'] / totalStores) * 100), color: '#3B82F6' },
            { name: 'Free Trial', count: planCounts['Trial'], pct: Math.round((planCounts['Trial'] / totalStores) * 100), color: '#6B7280' },
        ];

        // 5. Recent signups
        const recentStores = await Store.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('merchantId');

        const recentSignups = [];
        for (const store of recentStores) {
            const sub = await Subscription.findOne({ store: store._id, status: 'active' }).populate('plan');
            recentSignups.push({
                name: store.storeName,
                owner: store.merchantId?.name || 'Unknown',
                email: store.merchantId?.email || 'N/A',
                plan: sub?.plan?.planName || 'Trial',
                time: store.createdAt
            });
        }

        // 6. Live Activity Feed
        const activities = [];

        // Add registrations
        latestStoresLoop:
        for (const s of recentStores.slice(0, 3)) {
            activities.push({
                icon: '🏪',
                text: `New store "${s.storeName}" registered`,
                time: s.createdAt,
                type: 'registration'
            });
        }

        // Add tickets
        const latestTickets = await SupportTicket.find().sort({ createdAt: -1 }).limit(3);
        latestTickets.forEach(t => {
            activities.push({
                icon: '📣',
                text: `New support ticket: "${t.title}"`,
                time: t.createdAt,
                type: 'ticket'
            });
        });

        // Add subscriptions
        const latestSubs = await Subscription.find().sort({ createdAt: -1 }).limit(3).populate('plan');
        latestSubs.forEach(sub => {
            activities.push({
                icon: '🎉',
                text: `Store subscription activated: ${sub.plan?.planName || 'Plan'}`,
                time: sub.createdAt,
                type: 'subscription'
            });
        });

        // Sort all activities by time desc
        activities.sort((a, b) => b.time - a.time);
        const activityFeed = activities.slice(0, 6).map(act => ({
            icon: act.icon,
            text: act.text,
            time: act.time,
            type: act.type
        }));

        res.status(200).json({
            success: true,
            data: {
                kpi: {
                    activeStores: activeStoresCount,
                    totalStores: totalStoresCount,
                    mrr,
                    activeMerchants: totalMerchantsCount,
                    newSignups30d,
                    newSignupsChange
                },
                quickStats: {
                    openTickets,
                    customDomains: customDomainsCount,
                    payingStores: activePaidSubscriptionsCount
                },
                revenueTrend: dailyRevenue,
                planDist,
                recentSignups,
                activityFeed
            }
        });
    } catch (error) {
        console.error('Error fetching superadmin overview:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
