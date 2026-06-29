import Vendor from '../models/Vendor.js';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

// @desc    Get all vendors for logged-in merchant's store
// @route   GET /api/vendors
// @access  Private/Merchant
export const getVendors = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'] || req.query.storeId;
        if (!storeId) {
            return res.status(400).json({ message: 'Store ID is required' });
        }
        const filter = req.merchant 
            ? { merchant: req.merchant._id, store: storeId } 
            : { store: storeId, isActive: true };

        const vendors = await Vendor.find(filter).sort({ createdAt: -1 });
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single vendor
// @route   GET /api/vendors/:id
// @access  Private/Merchant
export const getVendor = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'] || req.query.storeId;
        if (!storeId) {
            return res.status(400).json({ message: 'Store ID is required' });
        }
        const filter = req.merchant 
            ? { _id: req.params.id, merchant: req.merchant._id, store: storeId } 
            : { _id: req.params.id, store: storeId };

        const vendor = await Vendor.findOne(filter);
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        res.json(vendor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a vendor
// @route   POST /api/vendors
// @access  Private/Merchant
export const createVendor = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ message: 'Store ID header (x-store-id) is required' });
        }
        const { 
            name, businessName, businessProfile, logo, profileImage, email, mobile, password, commission, 
            gstNumber, panNumber, bankDetails, address, city, state, pincode, isActive 
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Vendor name is required' });
        }
        if (!businessName || !businessName.trim()) {
            return res.status(400).json({ message: 'Business name is required' });
        }
        if (!email || !email.trim()) {
            return res.status(400).json({ message: 'Vendor email is required' });
        }
        if (!mobile || !mobile.trim()) {
            return res.status(400).json({ message: 'Phone number is required' });
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password is required and must be at least 6 characters long' });
        }

        // Check for duplicate email within this store
        const existing = await Vendor.findOne({ store: storeId, email: email.trim().toLowerCase() });
        if (existing) {
            return res.status(400).json({ message: 'A vendor with this email already exists' });
        }

        const vendor = await Vendor.create({
            merchant: req.merchant._id,
            store: storeId,
            name: name.trim(),
            businessName: businessName.trim(),
            businessProfile: businessProfile || '',
            logo: logo || '',
            profileImage: profileImage || '',
            email: email.trim().toLowerCase(),
            mobile: mobile.trim(),
            password: password,
            commission: commission !== undefined ? Number(commission) : 10,
            gstNumber: gstNumber || '',
            panNumber: panNumber || '',
            bankDetails: {
                accountNumber: bankDetails?.accountNumber || '',
                bankName: bankDetails?.bankName || '',
                accountHolderName: bankDetails?.accountHolderName || '',
                ifscCode: bankDetails?.ifscCode || ''
            },
            address: address || '',
            city: city || '',
            state: state || '',
            pincode: pincode || '',
            isActive: isActive !== undefined ? isActive : true
        });

        res.status(201).json(vendor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a vendor
// @route   PUT /api/vendors/:id
// @access  Private/Merchant
export const updateVendor = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ message: 'Store ID header (x-store-id) is required' });
        }
        const vendor = await Vendor.findOne({ _id: req.params.id, merchant: req.merchant._id, store: storeId });
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        const { 
            name, businessName, businessProfile, logo, profileImage, email, mobile, password, commission, 
            gstNumber, panNumber, bankDetails, address, city, state, pincode, isActive 
        } = req.body;

        // If email is changing, check for duplicates
        if (email && email.trim().toLowerCase() !== vendor.email) {
            const existing = await Vendor.findOne({
                store: storeId,
                email: email.trim().toLowerCase(),
                _id: { $ne: vendor._id }
            });
            if (existing) {
                return res.status(400).json({ message: 'A vendor with this email already exists' });
            }
        }

        vendor.name = name !== undefined ? name.trim() : vendor.name;
        vendor.businessName = businessName !== undefined ? businessName.trim() : vendor.businessName;
        vendor.businessProfile = businessProfile !== undefined ? businessProfile : vendor.businessProfile;
        vendor.logo = logo !== undefined ? logo : vendor.logo;
        vendor.profileImage = profileImage !== undefined ? profileImage : vendor.profileImage;
        vendor.email = email !== undefined ? email.trim().toLowerCase() : vendor.email;
        vendor.mobile = mobile !== undefined ? mobile.trim() : vendor.mobile;
        vendor.commission = commission !== undefined ? Number(commission) : vendor.commission;
        vendor.gstNumber = gstNumber !== undefined ? gstNumber : vendor.gstNumber;
        vendor.panNumber = panNumber !== undefined ? panNumber : vendor.panNumber;
        
        if (bankDetails) {
            vendor.bankDetails = {
                accountNumber: bankDetails.accountNumber !== undefined ? bankDetails.accountNumber : vendor.bankDetails.accountNumber,
                bankName: bankDetails.bankName !== undefined ? bankDetails.bankName : vendor.bankDetails.bankName,
                accountHolderName: bankDetails.accountHolderName !== undefined ? bankDetails.accountHolderName : vendor.bankDetails.accountHolderName,
                ifscCode: bankDetails.ifscCode !== undefined ? bankDetails.ifscCode : vendor.bankDetails.ifscCode
            };
        }

        vendor.address = address !== undefined ? address : vendor.address;
        vendor.city = city !== undefined ? city : vendor.city;
        vendor.state = state !== undefined ? state : vendor.state;
        vendor.pincode = pincode !== undefined ? pincode : vendor.pincode;
        vendor.isActive = isActive !== undefined ? isActive : vendor.isActive;

        if (password && password.trim().length >= 6) {
            vendor.password = password;
        }

        const updatedVendor = await vendor.save();
        res.json(updatedVendor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a vendor
// @route   DELETE /api/vendors/:id
// @access  Private/Merchant
export const deleteVendor = async (req, res) => {
    try {
        const storeId = req.headers['x-store-id'];
        if (!storeId) {
            return res.status(400).json({ message: 'Store ID header (x-store-id) is required' });
        }
        const vendor = await Vendor.findOne({ _id: req.params.id, merchant: req.merchant._id, store: storeId });
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        await Vendor.deleteOne({ _id: vendor._id });
        res.json({ message: 'Vendor deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Upload vendor logo
// @route   POST /api/vendors/upload
// @access  Private/Merchant
export const uploadVendorLogo = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload an image file' });
        }

        const uploadDir = process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filename = `vendor-asset-${Date.now()}.webp`;
        const filepath = path.join(uploadDir, filename);

        await sharp(req.file.buffer)
            .resize(400, 400, { fit: 'cover', withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(filepath);

        res.json({ url: `/uploads/${filename}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
