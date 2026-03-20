import express from 'express';
import { protect, adminOnly as admin } from '../middleware/authMiddleware.js';
import { exportData } from '../controllers/exportController.js';

const router = express.Router();

router.get('/export-data', protect, admin, exportData);

export default router;
