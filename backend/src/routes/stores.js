import express from 'express';
import {
    getStores,
    getStore,
    createStore,
    updateStore,
    deleteStore,
    verifyStorePassword,
    getStoreImage
} from '../controllers/storeController.js';

import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getStores)
    .post(createStore);

router.route('/:id')
    .get(getStore)
    .put(updateStore)
    .delete(deleteStore);

router.post('/:id/verify-password', protect, adminOnly, verifyStorePassword);
router.get('/:id/image', getStoreImage);

export default router;
