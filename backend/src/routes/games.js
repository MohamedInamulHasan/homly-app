import express from 'express';
import { submitScore, getLeaderboard, getMyScore } from '../controllers/gameController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/score', protect, submitScore);
router.get('/leaderboard/:mode', getLeaderboard);
router.get('/my-score/:mode', protect, getMyScore);

export default router;
