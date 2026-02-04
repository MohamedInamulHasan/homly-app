import express from 'express';
import { getUploadSignature } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/upload/signature
// @desc    Get Cloudinary upload signature
// @access  Private (authenticated users)
router.get('/signature', protect, getUploadSignature);

export default router;
