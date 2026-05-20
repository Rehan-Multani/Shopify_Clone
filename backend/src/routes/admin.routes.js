import { Router } from 'express';
import { protect, requireRole } from '../middleware/auth.js';
import {
  overview, listMerchants, toggleMerchantStatus, listStores, updateStoreStatus,
  listSubscriptions, listAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement,
} from '../controllers/admin.controller.js';

const router = Router();
router.use(protect, requireRole('master_admin'));

router.get('/overview', overview);

router.get('/merchants', listMerchants);
router.patch('/merchants/:id/toggle', toggleMerchantStatus);

router.get('/stores', listStores);
router.patch('/stores/:id/status', updateStoreStatus);

router.get('/subscriptions', listSubscriptions);

router.get('/announcements', listAnnouncements);
router.post('/announcements', createAnnouncement);
router.patch('/announcements/:id', updateAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

export default router;
