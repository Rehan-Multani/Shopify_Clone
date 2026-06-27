import SupportTicket from '../models/SupportTicket.js';
import Merchant from '../models/Merchant.js';

// Create a new support ticket
export const createTicket = async (req, res) => {
    try {
        const { title, description, priority, storeId: bodyStoreId, merchantId: adminSpecMerchantId } = req.body;
        const headerStoreId = req.headers['x-store-id'];
        const storeId = bodyStoreId || headerStoreId || undefined;

        let merchantId;
        let createdBy = 'merchant';

        if (req.admin) {
            createdBy = 'admin';
            merchantId = adminSpecMerchantId;
            if (!merchantId) {
                return res.status(400).json({ status: 'fail', message: 'merchantId is required for admin-created tickets' });
            }
        } else if (req.merchant) {
            merchantId = req.merchant._id;
        } else {
            return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
        }

        // Validate merchant exists
        const merchantExists = await Merchant.findById(merchantId);
        if (!merchantExists) {
            return res.status(404).json({ status: 'fail', message: 'Merchant not found' });
        }

        const ticket = await SupportTicket.create({
            merchantId,
            storeId: (storeId && storeId !== '') ? storeId : undefined,
            title,
            description,
            priority: priority || 'medium',
            createdBy,
            messages: [{
                sender: createdBy,
                message: description
            }]
        });

        const populated = await SupportTicket.findById(ticket._id)
            .populate('merchantId', 'name email businessName')
            .populate('storeId', 'storeName');

        res.status(201).json({
            status: 'success',
            data: populated
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Get list of support tickets
export const getTickets = async (req, res) => {
    try {
        let filter = {};

        if (req.admin) {
            // Admins can see all tickets
            filter = {};
        } else if (req.merchant) {
            // Merchants only see their own tickets
            filter = { merchantId: req.merchant._id };
        } else {
            return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
        }

        const tickets = await SupportTicket.find(filter)
            .populate('merchantId', 'name email businessName')
            .populate('storeId', 'storeName')
            .sort({ updatedAt: -1 });

        res.status(200).json({
            status: 'success',
            results: tickets.length,
            data: tickets
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Get a single support ticket by ID
export const getTicketById = async (req, res) => {
    try {
        const ticket = await SupportTicket.findById(req.params.id)
            .populate('merchantId', 'name email businessName')
            .populate('storeId', 'storeName');

        if (!ticket) {
            return res.status(404).json({ status: 'fail', message: 'Support ticket not found' });
        }

        // Check permission: Merchant can only access their own tickets
        if (!req.admin && req.merchant && ticket.merchantId._id.toString() !== req.merchant._id.toString()) {
            return res.status(403).json({ status: 'fail', message: 'Forbidden' });
        }

        res.status(200).json({
            status: 'success',
            data: ticket
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Add a reply/message to a support ticket
export const addMessage = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ status: 'fail', message: 'Message content is required' });
        }

        const ticket = await SupportTicket.findById(req.params.id);
        if (!ticket) {
            return res.status(404).json({ status: 'fail', message: 'Support ticket not found' });
        }

        // Check permission
        if (!req.admin && req.merchant && ticket.merchantId.toString() !== req.merchant._id.toString()) {
            return res.status(403).json({ status: 'fail', message: 'Forbidden' });
        }

        let sender = 'merchant';
        if (req.admin) {
            sender = 'admin';
        }

        // Append message
        ticket.messages.push({
            sender,
            message
        });

        // Set status to in-progress if admin replies to an open ticket
        if (req.admin && ticket.status === 'open') {
            ticket.status = 'in-progress';
        }

        await ticket.save();

        res.status(200).json({
            status: 'success',
            data: ticket
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Update ticket status or priority
export const updateTicketStatus = async (req, res) => {
    try {
        const { status, priority } = req.body;
        const ticket = await SupportTicket.findById(req.params.id);

        if (!ticket) {
            return res.status(404).json({ status: 'fail', message: 'Support ticket not found' });
        }

        // Check permission (only admins can change status/priority of a ticket, or merchants can close their own ticket)
        if (!req.admin) {
            if (req.merchant && ticket.merchantId.toString() === req.merchant._id.toString()) {
                if (status && (status === 'closed' || status === 'resolved')) {
                    // Allowed
                } else {
                    return res.status(403).json({ status: 'fail', message: 'Merchants can only close/resolve their own tickets' });
                }
            } else {
                return res.status(403).json({ status: 'fail', message: 'Forbidden' });
            }
        }

        if (status) ticket.status = status;
        if (priority && req.admin) ticket.priority = priority;

        await ticket.save();

        res.status(200).json({
            status: 'success',
            data: ticket
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};
