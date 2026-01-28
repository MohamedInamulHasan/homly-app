import ServiceRequest from '../models/ServiceRequest.js';
import Service from '../models/Service.js';
import { sendServiceRequestNotification } from '../services/emailService.js';
import { sendServiceRequestTelegramNotification } from '../services/telegramService.js';

// @desc    Create a new service request
// @route   POST /api/service-requests
// @access  Private
export const createServiceRequest = async (req, res) => {
    try {
        console.log('Received service request payload:', req.body);
        const { serviceId } = req.body;

        if (!serviceId) {
            console.error('Service ID missing in payload');
            return res.status(400).json({ message: 'Service ID is required' });
        }

        const service = await Service.findById(serviceId);
        if (!service) {
            console.error(`Service not found for ID: ${serviceId}`);
            return res.status(404).json({ message: 'Service not found' });
        }

        if (!req.user || !req.user._id) {
            console.error('User not authenticated or missing from request object');
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const serviceRequest = new ServiceRequest({
            user: req.user._id,
            service: serviceId,
            status: 'Pending' // Explicitly set default
        });

        const createdRequest = await serviceRequest.save();

        console.log('Service Request created successfully:', createdRequest._id);

        // Populate service details for the response
        await createdRequest.populate('service');
        await createdRequest.populate('user', 'name email mobile');

        // Send notification email
        try {
            await sendServiceRequestNotification(createdRequest);
            console.log('📧 Service request notification sent');
        } catch (emailError) {
            console.error('❌ Failed to send service request notification:', emailError);
            // Don't fail the request if email fails
        }

        // Send Telegram notification
        try {
            await sendServiceRequestTelegramNotification(createdRequest);
            console.log('📱 Service request Telegram notification sent');
        } catch (telegramError) {
            console.error('❌ Failed to send service request Telegram notification:', telegramError);
            // Don't fail the request if Telegram fails
        }

        res.status(201).json(createdRequest);
    } catch (error) {
        console.error('Error creating service request:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all service requests (Admin)
// @route   GET /api/service-requests
// @access  Private/Admin
export const getServiceRequests = async (req, res) => {
    try {
        const requests = await ServiceRequest.find({})
            .populate('user', 'name email mobile')
            .populate('service', 'name image mobile')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update service request status
// @route   PUT /api/service-requests/:id
// @access  Private/Admin
export const updateServiceRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const request = await ServiceRequest.findById(req.params.id);

        if (request) {
            request.status = status;
            const updatedRequest = await request.save();
            await updatedRequest.populate('user', 'name email mobile');
            await updatedRequest.populate('service', 'name image mobile');
            res.json(updatedRequest);
        } else {
            res.status(404).json({ message: 'Service Request not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete service request
// @route   DELETE /api/service-requests/:id
// @access  Private/Admin
export const deleteServiceRequest = async (req, res) => {
    try {
        const request = await ServiceRequest.findById(req.params.id);

        if (request) {
            await request.deleteOne();
            res.json({ message: 'Service Request removed' });
        } else {
            res.status(404).json({ message: 'Service Request not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
