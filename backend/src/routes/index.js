import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import storeRoutes from './store.routes.js';
import productRoutes from './product.routes.js';
import categoryRoutes from './category.routes.js';
import customerRoutes from './customer.routes.js';
import orderRoutes from './order.routes.js';
import planRoutes from './plan.routes.js';
import adminRoutes from './admin.routes.js';
import uploadRoutes from './upload.routes.js';
import publicRoutes from './public.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok', uptime: process.uptime() });
});

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/stores', storeRoutes);
router.use('/stores/:storeId/products', productRoutes);
router.use('/stores/:storeId/categories', categoryRoutes);
router.use('/stores/:storeId/customers', customerRoutes);
router.use('/stores/:storeId/orders', orderRoutes);
router.use('/plans', planRoutes);
router.use('/admin', adminRoutes);
router.use('/uploads', uploadRoutes);
router.use('/public', publicRoutes);

export default router;
