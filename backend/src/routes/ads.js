import express from 'express';
import {
    getAds,
    getAd,
    createAd,
    updateAd,
    deleteAd,
    getAdImage
} from '../controllers/adController.js';

const router = express.Router();

router.route('/')
    .get(getAds)
    .post(createAd);

router.route('/:id')
    .get(getAd)
    .put(updateAd)
    .delete(deleteAd);


router.get('/:id/image', getAdImage);

export default router;
