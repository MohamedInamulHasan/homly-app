import express from 'express';
import { getGameStatus, submitScore, rewardDailyWinner } from '../controllers/gameController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/status').get(protect, getGameStatus);
router.route('/score').post(protect, submitScore);
router.route('/reward-winner').post(protect, adminOnly, rewardDailyWinner);

export default router;
