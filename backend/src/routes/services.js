import express from 'express';
import Service from '../models/Service.js';
import { protect, adminOnly as admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Fetch all services
// @route   GET /api/services
// @access  Public
router.get('/', async (req, res) => {
    try {
        const services = await Service.find({ isActive: true });
        res.status(200).json({
            success: true,
            data: services
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Create a service
// @route   POST /api/services
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    try {
        const { name, description, image, address, mobile } = req.body;

        const service = new Service({
            name,
            description,
            image,
            address,
            mobile
        });

        const createdService = await service.save();
        res.status(201).json(createdService);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const { name, description, image, address, mobile } = req.body;
        const service = await Service.findById(req.params.id);

        if (service) {
            service.name = name || service.name;
            service.description = description || service.description;
            service.image = image || service.image;
            service.address = address || service.address;
            service.mobile = mobile || service.mobile;

            const updatedService = await service.save();
            res.json(updatedService);
        } else {
            res.status(404).json({ message: 'Service not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (service) {
            await Service.deleteOne({ _id: service._id });
            res.json({ message: 'Service removed' });
        } else {
            res.status(404).json({ message: 'Service not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
