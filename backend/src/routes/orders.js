import express from 'express';
import {
    createOrder,
    getOrders,
    getOrder,
    updateOrderStatus,
    deleteOrder
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All order routes require authentication
router.route('/')
    .post(protect, createOrder)
    .get(protect, getOrders);

router.route('/:id')
    .get(protect, getOrder)
    .put(protect, updateOrderStatus)
    .delete(protect, deleteOrder);

export default router;
