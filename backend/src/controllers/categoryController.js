import Category from '../models/Category.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res, next) => {
    try {
        const categories = await Category.find({ isActive: true })
            .select('-image') // Exclude heavy image data
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            res.status(404);
            throw new Error('Category not found');
        }

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res, next) => {
    try {
        const { name, name_ta, description, icon, image, subcategories } = req.body;

        // Check if category already exists
        const categoryExists = await Category.findOne({ name });

        if (categoryExists) {
            res.status(400);
            throw new Error('Category already exists');
        }

        const category = await Category.create({
            name,
            name_ta,
            description,
            icon,
            image,
            subcategories: subcategories || []
        });

        res.status(201).json({
            success: true,
            data: category
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res, next) => {
    try {
        let category = await Category.findById(req.params.id);

        if (!category) {
            res.status(404);
            throw new Error('Category not found');
        }

        category = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            res.status(404);
            throw new Error('Category not found');
        }

        await category.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};
// @desc    Get category image
// @route   GET /api/categories/:id/image
// @access  Public
export const getCategoryImage = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id).select('image');

        if (!category || !category.image) {
            return res.status(404).send('Image not found');
        }

        if (category.image.startsWith('data:image')) {
            const matches = category.image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
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
            res.redirect(category.image);
        }
    } catch (error) {
        next(error);
    }
};
