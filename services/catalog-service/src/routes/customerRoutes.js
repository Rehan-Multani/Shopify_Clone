import express from 'express';
import { 
    getCustomers, 
    createCustomer, 
    getCustomer, 
    updateCustomer, 
    deleteCustomer, 
    uploadCustomerImage, 
    importCustomers,
    subscribeNewsletter,
    getSubscribers,
    deleteSubscriber,
    registerCustomer,
    loginCustomer,
    toggleWishlist,
    getWishlist,
    addCustomerAddress,
    updateCustomerAddress,
    deleteCustomerAddress,
    setDefaultCustomerAddress
} from '../controllers/customerController.js';
import { uploadProductImagesMiddleware } from '../../../shared/uploadMiddleware.js';

const router = express.Router();

router.post('/upload', uploadProductImagesMiddleware, uploadCustomerImage);
router.post('/import', importCustomers);

// Customer Auth routes
router.post('/register', registerCustomer);
router.post('/login', loginCustomer);

// Wishlist routes
router.route('/:id/wishlist')
    .get(getWishlist)
    .put(toggleWishlist);

// Address book routes
router.route('/:id/addresses')
    .post(addCustomerAddress);

router.route('/:id/addresses/:addressId')
    .put(updateCustomerAddress)
    .delete(deleteCustomerAddress);

router.route('/:id/addresses/:addressId/default')
    .put(setDefaultCustomerAddress);

// Newsletter Subscriber routes
router.post('/subscribe', subscribeNewsletter);
router.get('/subscribers', getSubscribers);
router.delete('/subscribers/:id', deleteSubscriber);

router.route('/')
    .get(getCustomers)
    .post(createCustomer);

router.route('/:id')
    .get(getCustomer)
    .put(updateCustomer)
    .delete(deleteCustomer);

export default router;
