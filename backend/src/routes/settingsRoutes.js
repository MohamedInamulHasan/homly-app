import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
import { protect, adminOnly as admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route to get settings (like delivery times which users need)
// You might want to restrict some settings to admin only, but for now delivery_times needs to be public
router.get('/:key?', getSettings);

// Admin only route to update settings
router.put('/:key', protect, admin, updateSettings);

export default router;
