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
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Service Routes
router.route('/')
    .get(getServices)
    .post(protect, adminOnly, createService);

router.put('/reorder', protect, adminOnly, updateServicesOrder);

router.route('/:id')
    .get(getService)
    .put(protect, adminOnly, updateService)
    .delete(protect, adminOnly, deleteService);

// Service Item Routes
router.route('/:id/items')
    .get(getServiceItems)
    .post(protect, adminOnly, createServiceItem);

router.put('/:id/items/reorder', protect, adminOnly, updateServiceItemsOrder);

// Note: Item updates/deletes should probably be under a dedicated items route or nested.
// For simplicity, defining them here but typical REST might be /items/:itemId. 
// However, since the controller methods for update/delete item depend on ':itemId', we need to route accordingly.
// Let's create a separate set of routes for items if they are not nested for UPDATE/DELETE, 
// OR we can just use the nested structure if we pass the ID.
// Actually, I'll use a direct path for item operations to avoid deep nesting issues if not needed.
// But wait, the previous plan implied `/api/services/:id/items`.
// Let's add specific routes for item manipulation.

router.route('/items/:itemId')
    .put(protect, adminOnly, updateServiceItem)
    .delete(protect, adminOnly, deleteServiceItem);

export default router;
