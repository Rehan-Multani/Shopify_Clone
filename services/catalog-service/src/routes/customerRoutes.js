import express from 'express';
import { getCustomers, createCustomer, getCustomer, updateCustomer, deleteCustomer, uploadCustomerImage, importCustomers } from '../controllers/customerController.js';
import { uploadProductImagesMiddleware } from '../../../shared/uploadMiddleware.js';

const router = express.Router();

router.post('/upload', uploadProductImagesMiddleware, uploadCustomerImage);
router.post('/import', importCustomers);

router.route('/')
    .get(getCustomers)
    .post(createCustomer);

router.route('/:id')
    .get(getCustomer)
    .put(updateCustomer)
    .delete(deleteCustomer);

export default router;
