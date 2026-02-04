import express from 'express';
import {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductImage
} from '../controllers/productController.js';
import { protect, adminOnly, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(optionalAuth, getProducts)
    .post(protect, adminOnly, createProduct);

router.route('/:id')
    .get(optionalAuth, getProduct)
    .put(protect, adminOnly, updateProduct)
    .delete(protect, adminOnly, deleteProduct);


router.get('/:id/image', getProductImage);

export default router;
