import Customer from '../models/Customer.js';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// @desc    Get all customers
// @route   GET /api/customers
export const getCustomers = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ message: 'Store ID header (x-store-id) is required' });
        }
        const customers = await Customer.find({ merchant: req.merchant._id, store: storeId }).sort({ createdAt: -1 });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get a single customer
// @route   GET /api/customers/:id
export const getCustomer = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ message: 'Store ID header (x-store-id) is required' });
        }
        const customer = await Customer.findOne({ _id: req.params.id, merchant: req.merchant._id, store: storeId });
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }
        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a customer
// @route   POST /api/customers
export const createCustomer = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ message: 'Store ID header (x-store-id) is required' });
        }
        const { name, email, number, image } = req.body;

        if (!name || !name.trim()) return res.status(400).json({ message: 'Name is required' });
        if (!email || !email.trim()) return res.status(400).json({ message: 'Email is required' });
        if (!number || !number.trim()) return res.status(400).json({ message: 'Phone number is required' });

        // Check for duplicate email or phone number in this store
        const existing = await Customer.findOne({
            store: storeId,
            $or: [
                { email: email.trim().toLowerCase() },
                { number: number.trim() }
            ]
        });
        if (existing) {
            if (existing.email === email.trim().toLowerCase()) {
                return res.status(400).json({ message: 'A customer with this email already exists' });
            }
            if (existing.number === number.trim()) {
                return res.status(400).json({ message: 'A customer with this phone number already exists' });
            }
        }

        const customer = await Customer.create({
            merchant: req.merchant._id,
            store: storeId,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            number: number.trim(),
            image: image || ''
        });

        res.status(201).json(customer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a customer
// @route   PUT /api/customers/:id
export const updateCustomer = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ message: 'Store ID header (x-store-id) is required' });
        }
        const customer = await Customer.findOne({ _id: req.params.id, merchant: req.merchant._id, store: storeId });
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        const { name, email, number, image } = req.body;

        // Check for duplicate email or phone number in this store (if changed)
        const checkQuery = {
            store: storeId,
            _id: { $ne: customer._id },
            $or: []
        };
        if (email) checkQuery.$or.push({ email: email.trim().toLowerCase() });
        if (number) checkQuery.$or.push({ number: number.trim() });

        if (checkQuery.$or.length > 0) {
            const existing = await Customer.findOne(checkQuery);
            if (existing) {
                if (email && existing.email === email.trim().toLowerCase()) {
                    return res.status(400).json({ message: 'A customer with this email already exists' });
                }
                if (number && existing.number === number.trim()) {
                    return res.status(400).json({ message: 'A customer with this phone number already exists' });
                }
            }
        }

        customer.name = name !== undefined ? name.trim() : customer.name;
        customer.email = email !== undefined ? email.trim().toLowerCase() : customer.email;
        customer.number = number !== undefined ? number.trim() : customer.number;
        customer.image = image !== undefined ? image : customer.image;

        const updatedCustomer = await customer.save();
        res.json(updatedCustomer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a customer
// @route   DELETE /api/customers/:id
export const deleteCustomer = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ message: 'Store ID header (x-store-id) is required' });
        }
        const customer = await Customer.findOne({ _id: req.params.id, merchant: req.merchant._id, store: storeId });
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found' });
        }

        await Customer.deleteOne({ _id: customer._id });
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload profile image
// @route   POST /api/customers/upload
export const uploadCustomerImage = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        const uploadDir = process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const file = req.files[0];
        const filename = `customer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
        const filepath = path.join(uploadDir, filename);

        await sharp(file.buffer)
            .resize(400, 400, { fit: 'cover' })
            .webp({ quality: 80 })
            .toFile(filepath);

        res.json({ url: `/uploads/${filename}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Import customers from JSON list (parsed CSV)
// @route   POST /api/customers/import
export const importCustomers = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ message: 'Store ID header (x-store-id) is required' });
        }
        const { customers } = req.body;
        if (!Array.isArray(customers) || customers.length === 0) {
            return res.status(400).json({ message: 'Customers array is required and cannot be empty' });
        }

        const validCustomers = [];
        for (const item of customers) {
            if (!item.name || !item.email || !item.number) continue;
            
            // Check if already exists in this store (email or phone number)
            const existing = await Customer.findOne({ 
                store: storeId, 
                $or: [
                    { email: item.email.trim().toLowerCase() },
                    { number: item.number.trim() }
                ]
            });
            if (existing) continue;

            // Also check duplicates within the CSV list itself before adding
            const isDupInList = validCustomers.some(vc => vc.email === item.email.trim().toLowerCase() || vc.number === item.number.trim());
            if (isDupInList) continue;

            validCustomers.push({
                merchant: req.merchant._id,
                store: storeId,
                name: item.name.trim(),
                email: item.email.trim().toLowerCase(),
                number: item.number.trim(),
                image: item.image || ''
            });
        }

        if (validCustomers.length > 0) {
            await Customer.insertMany(validCustomers);
        }

        res.json({ message: `${validCustomers.length} customers imported successfully` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
