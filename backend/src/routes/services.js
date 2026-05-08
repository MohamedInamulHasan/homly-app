import express from 'express';
import {
    getServices,
    getService,
    createService,
    updateService,
    deleteService,
    getServiceItems,
    createServiceItem,
    updateServiceItem,
    deleteServiceItem,
    updateServicesOrder,
    updateServiceItemsOrder
} from '../controllers/serviceController.js';
import { protect, adminOnly, adminOrServiceAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Service Item Direct Routes (defined FIRST to avoid conflict with /:id/items)
router.route('/items/:itemId')
    .put(protect, adminOrServiceAdmin, updateServiceItem)
    .delete(protect, adminOrServiceAdmin, deleteServiceItem);

// Service Routes
router.route('/')
    .get(getServices)
    .post(protect, adminOnly, createService);

router.put('/reorder', protect, adminOnly, updateServicesOrder);

router.route('/:id')
    .get(getService)
    .put(protect, adminOrServiceAdmin, updateService)
    .delete(protect, adminOnly, deleteService);

// Service Item Routes (Nested)
router.route('/:id/items')
    .get(getServiceItems)
    .post(protect, adminOrServiceAdmin, createServiceItem);

router.put('/:id/items/reorder', protect, adminOrServiceAdmin, updateServiceItemsOrder);

export default router;
