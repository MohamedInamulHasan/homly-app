import express from 'express';
import {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductImage,
    updateProductsOrder
} from '../controllers/productController.js';
import { protect, adminOnly, optionalAuth, adminOrStoreAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(optionalAuth, getProducts)
    .post(protect, adminOrStoreAdmin, createProduct);

router.put('/reorder', protect, adminOrStoreAdmin, updateProductsOrder);

router.route('/:id')
    .get(optionalAuth, getProduct)
    .put(protect, adminOrStoreAdmin, updateProduct)
    .delete(protect, adminOrStoreAdmin, deleteProduct);


router.get('/:id/image', getProductImage);

export default router;
