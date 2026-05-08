import express from 'express';
const router = express.Router();
import {
    createServiceRequest,
    getServiceRequests,
    updateServiceRequestStatus,
    deleteServiceRequest
} from '../controllers/serviceRequestController.js';
import { protect, adminOrServiceAdmin, anyAdmin } from '../middleware/authMiddleware.js';

router.route('/')
    .post(protect, createServiceRequest)
    .get(protect, anyAdmin, getServiceRequests);

router.route('/:id')
    .put(protect, anyAdmin, updateServiceRequestStatus)
    .delete(protect, adminOrServiceAdmin, deleteServiceRequest);

export default router;
