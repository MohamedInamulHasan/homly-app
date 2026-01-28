import Store from '../models/Store.js';
import bcrypt from 'bcryptjs';

// @desc    Get all stores
// @route   GET /api/stores
// @access  Public
export const getStores = async (req, res, next) => {
    try {
        const { type, city } = req.query;
        let query = { isActive: true };

        if (type) {
            query.type = type;
        }

        if (city) {
            query.city = { $regex: city, $options: 'i' };
        }

        const stores = await Store.find({})
            .select('-image') // Exclude heavy image data
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: stores.length,
            data: stores
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single store
// @route   GET /api/stores/:id
// @access  Public
export const getStore = async (req, res, next) => {
    try {
        const store = await Store.findById(req.params.id);

        if (!store) {
            res.status(404);
            throw new Error('Store not found');
        }

        res.status(200).json({
            success: true,
            data: store
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new store
// @route   POST /api/stores
// @access  Private/Admin
export const createStore = async (req, res, next) => {
    try {
        const store = await Store.create(req.body);

        res.status(201).json({
            success: true,
            data: store
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update store
// @route   PUT /api/stores/:id
// @access  Private/Admin
export const updateStore = async (req, res, next) => {
    try {
        // Prevent overwriting existing image with empty string
        const updateData = { ...req.body };
        if (!updateData.image) {
            delete updateData.image;
        }

        const store = await Store.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        if (!store) {
            res.status(404);
            throw new Error('Store not found');
        }

        res.status(200).json({
            success: true,
            data: store
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete store
// @route   DELETE /api/stores/:id
// @access  Private/Admin
export const deleteStore = async (req, res, next) => {
    try {
        const store = await Store.findByIdAndDelete(req.params.id);

        if (!store) {
            res.status(404);
            throw new Error('Store not found');
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Verify store password
// @route   POST /api/stores/:id/verify-password
// @access  Private/Admin
export const verifyStorePassword = async (req, res, next) => {
    try {
        const { password } = req.body;

        if (!password) {
            res.status(400);
            throw new Error('Please provide a password');
        }

        const store = await Store.findById(req.params.id).select('+password');

        if (!store) {
            res.status(404);
            throw new Error('Store not found');
        }

        const isMatch = await bcrypt.compare(password, store.password);

        if (!isMatch) {
            res.status(401);
            throw new Error('Invalid password');
        }

        res.status(200).json({
            success: true,
            message: 'Password verified'
        });
    } catch (error) {
        next(error);
    }
};
// @desc    Get store image
// @route   GET /api/stores/:id/image
// @access  Public
export const getStoreImage = async (req, res, next) => {
    try {
        console.log(`🏪 Fetching image for store: ${req.params.id}`);
        const store = await Store.findById(req.params.id).select('image');

        if (!store || !store.image) {
            console.warn(`⚠️ Image not found for store: ${req.params.id}`);
            return res.status(404).send('Image not found');
        }

        if (store.image.startsWith('data:image')) {
            const matches = store.image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches.length !== 3) {
                return res.status(404).send('Invalid image data');
            }
            const type = matches[1];
            const buffer = Buffer.from(matches[2], 'base64');

            res.writeHead(200, {
                'Content-Type': type,
                'Content-Length': buffer.length
            });
            res.end(buffer);
        } else {
            res.redirect(store.image);
        }
    } catch (error) {
        next(error);
    }
};
