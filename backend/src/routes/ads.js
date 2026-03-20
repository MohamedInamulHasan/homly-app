import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import {
    getAds,
    getAd,
    createAd,
    updateAd,
    deleteAd,
    getAdImage,
    updateAdsOrder
} from '../controllers/adController.js';

const router = express.Router();

router.route('/')
    .get(getAds)
    .post(createAd);

router.put('/reorder', protect, adminOnly, updateAdsOrder);

router.route('/:id')
    .get(getAd)
    .put(updateAd)
    .delete(deleteAd);


router.get('/:id/image', getAdImage);

export default router;
