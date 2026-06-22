import multer from 'multer';

// Storage settings: keep files in memory as buffer for sharp to process
const storage = multer.memoryStorage();

// File filter: accept only image files
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Please upload only images (JPEG, PNG, WEBP, etc.)'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Single upload middleware for field named 'profile'
export const uploadMerchantProfileMiddleware = upload.single('profile');

// Single upload middleware for category image
export const uploadCategoryImageMiddleware = upload.single('image');

// Multiple upload middleware for product images (max 5)
export const uploadProductImagesMiddleware = upload.array('images', 5);
