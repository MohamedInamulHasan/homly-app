import express from 'express';
import {
    getAllNews,
    getNews,
    createNews,
    updateNews,
    deleteNews
} from '../controllers/newsController.js';

const router = express.Router();

router.route('/')
    .get(getAllNews)
    .post(createNews);

router.route('/:id')
    .get(getNews)
    .put(updateNews)
    .delete(deleteNews);

export default router;
