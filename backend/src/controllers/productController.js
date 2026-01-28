import Product from '../models/Product.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
    console.log('🔍 GET /api/products - Request received');
    try {
        const { category, search, featured, page, limit, fields } = req.query;
        let query = {};

        if (category) {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (featured) {
            query.featured = featured === 'true';
        }

        if (req.query.storeId) {
            query.storeId = req.query.storeId;
        }

        // Pagination
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 12; // Default 12 items per page (reduced from 50 for performance)
        const skip = (pageNum - 1) * limitNum;

        // Field selection (if specified)
        let selectFields = '';
        if (fields) {
            selectFields = fields.split(',').join(' ');
        }

        // Execute query with pagination
        // Removed .populate() to avoid N+1 query issue - frontend already has stores
        // TEMPORARY DEBUG: Exclude image to test if it's too big (Base64)
        const productsQuery = Product.find(query)
            .select('-image') // Exclude heavy image data for list view - use /:id/image endpoint
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        const products = await productsQuery;

        // Get total count for pagination
        const total = await Product.countDocuments(query);

        res.status(200).json({
            success: true,
            count: products.length,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            data: products
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id).populate('storeId', 'name');

        if (!product) {
            res.status(404);
            throw new Error('Product not found');
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res, next) => {
    try {
        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            data: product
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res, next) => {
    try {
        // Prevent overwriting existing image with empty string
        const updateData = { ...req.body };
        if (!updateData.image) {
            delete updateData.image;
        }

        // Also cleanup images array if it contains empty strings
        if (updateData.images && Array.isArray(updateData.images)) {
            updateData.images = updateData.images.filter(img => img && img.trim() !== '');
            if (updateData.images.length === 0) {
                delete updateData.images;
            }
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        if (!product) {
            res.status(404);
            throw new Error('Product not found');
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get product image
// @route   GET /api/products/:id/image
// @access  Public
export const getProductImage = async (req, res, next) => {
    try {
        console.log(`🖼️ Fetching image for product: ${req.params.id}`);
        const product = await Product.findById(req.params.id).select('image');

        if (!product || !product.image) {
            console.warn(`⚠️ Image not found for product: ${req.params.id}`);
            return res.status(404).send('Image not found');
        }

        console.log(`✅ Image found for product: ${req.params.id}, length: ${product.image.length}`);

        // Check if it's a Base64 string
        if (product.image.startsWith('data:image')) {
            const matches = product.image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
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
            // It's a URL (Cloudinary or placeholder) - redirect to it
            res.redirect(product.image);
        }
    } catch (error) {
        next(error);
    }
};

export const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            res.status(404);
            throw new Error('Product not found');
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};
