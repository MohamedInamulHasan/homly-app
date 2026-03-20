import Service from '../models/Service.js';
import ServiceItem from '../models/ServiceItem.js';

// @desc    Get all services
// @route   GET /api/services
// @access  Public
export const getServices = async (req, res) => {
    try {
        const services = await Service.find({ isActive: true }).sort({ order: 1, name: 1 });
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
export const getService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (service) {
            res.json(service);
        } else {
            res.status(404).json({ message: 'Service not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a service
// @route   POST /api/services
// @access  Private/Admin
export const createService = async (req, res) => {
    try {
        const { name, description, image, address, mobile, category } = req.body;
        const service = await Service.create({
            name,
            description,
            image,
            address,
            mobile,
            category
        });
        res.status(201).json(service);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a service
// @route   PUT /api/services/:id
// @access  Private/Admin
export const updateService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (service) {
            service.name = req.body.name || service.name;
            service.description = req.body.description || service.description;
            service.image = req.body.image || service.image;
            service.address = req.body.address || service.address;
            service.mobile = req.body.mobile || service.mobile;
            service.category = req.body.category || service.category;

            const updatedService = await service.save();
            res.json(updatedService);
        } else {
            res.status(404).json({ message: 'Service not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update services order
// @route   PUT /api/services/reorder
// @access  Private/Admin
export const updateServicesOrder = async (req, res) => {
    try {
        const { orderedIds } = req.body;

        if (!orderedIds || !Array.isArray(orderedIds)) {
            return res.status(400).json({ message: 'Invalid data format' });
        }

        const updates = orderedIds.map((id, index) => {
            return Service.findByIdAndUpdate(id, { order: index });
        });

        await Promise.all(updates);

        res.json({ message: 'Services reordered successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a service
// @route   DELETE /api/services/:id
// @access  Private/Admin
export const deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (service) {
            await service.deleteOne();
            // Also delete associated items
            await ServiceItem.deleteMany({ serviceId: service._id });
            res.json({ message: 'Service removed' });
        } else {
            res.status(404).json({ message: 'Service not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- Service Items ---

// @desc    Get service items
// @route   GET /api/services/:id/items
// @access  Public
export const getServiceItems = async (req, res) => {
    try {
        const items = await ServiceItem.find({ serviceId: req.params.id, isActive: true }).sort({ order: 1, name: 1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create service item
// @route   POST /api/services/:id/items
// @access  Private/Admin
export const createServiceItem = async (req, res) => {
    try {
        const { name, description, price, image } = req.body;
        const item = await ServiceItem.create({
            serviceId: req.params.id,
            name,
            description,
            price,
            image
        });
        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update service item
// @route   PUT /api/services/items/:itemId
// @access  Private/Admin
export const updateServiceItem = async (req, res) => {
    try {
        const item = await ServiceItem.findById(req.params.itemId);
        if (item) {
            item.name = req.body.name || item.name;
            item.description = req.body.description || item.description;
            item.price = req.body.price || item.price;
            item.image = req.body.image || item.image;

            const updatedItem = await item.save();
            res.json(updatedItem);
        } else {
            res.status(404).json({ message: 'Service Item not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update service items order
// @route   PUT /api/services/:id/items/reorder
// @access  Private/Admin
export const updateServiceItemsOrder = async (req, res) => {
    try {
        const { orderedIds } = req.body;

        if (!orderedIds || !Array.isArray(orderedIds)) {
            return res.status(400).json({ message: 'Invalid data format' });
        }

        const updates = orderedIds.map((id, index) => {
            return ServiceItem.findByIdAndUpdate(id, { order: index });
        });

        await Promise.all(updates);

        res.json({ message: 'Service items reordered successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete service item
// @route   DELETE /api/services/items/:itemId
// @access  Private/Admin
export const deleteServiceItem = async (req, res) => {
    try {
        const item = await ServiceItem.findById(req.params.itemId);
        if (item) {
            await item.deleteOne();
            res.json({ message: 'Service Item removed' });
        } else {
            res.status(404).json({ message: 'Service Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
