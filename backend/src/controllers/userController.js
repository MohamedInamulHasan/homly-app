import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../services/emailService.js';

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// Helper to send token in cookie
const sendTokenResponse = (user, statusCode, res) => {
    const token = generateToken(user._id);

    const options = {
        expires: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
        ),
        httpOnly: true, // Secure: not accessible via client-side JS
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // CSRF protection
    };

    res.status(statusCode)
        .cookie('jwt', token, options)
        .json({
            success: true,
            token, // Send token for client-side storage (Hybrid Auth)
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                address: user.address,
                mobile: user.mobile,
                storeId: user.storeId,
                coins: user.coins || 0
            }
        });
};

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req, res, next) => {
    try {
        const { name, email, password, mobile } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            mobile
        });

        if (user) {
            sendTokenResponse(user, 201, res);
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            sendTokenResponse(user, 200, res);
        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
export const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
        secure: process.env.NODE_ENV === 'production', // Must match set options
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // Must match set options
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.status(200).json({
                success: true,
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    mobile: user.mobile,
                    address: user.address,
                    coins: user.coins || 0
                }
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.mobile = req.body.mobile || user.mobile;
            user.address = req.body.address || user.address;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();
            sendTokenResponse(updatedUser, 200, res);
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).select('-password').populate('storeId', 'name');

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update user by admin
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUserByAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.mobile = req.body.mobile || user.mobile;
        user.address = req.body.address || user.address;

        if (req.body.role) {
            user.role = req.body.role;
        }

        if (req.body.storeId) {
            user.storeId = req.body.storeId;
        } else if (req.body.role === 'customer' || req.body.role === 'admin') {
            // If role changed to non-store-admin, remove storeId
            user.storeId = undefined;
        }

        // Debug logging for coin updates
        console.log('📝 updateUserByAdmin Request:', {
            id: req.params.id,
            body: req.body,
            coinsReceived: req.body.coins
        });

        if (req.body.coins !== undefined) {
            console.log(`🪙 Updating coins for user ${user._id}: ${user.coins} -> ${req.body.coins}`);
            user.coins = Number(req.body.coins);
        }

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.status(200).json({
            success: true,
            data: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                storeId: updatedUser.storeId,
                mobile: updatedUser.mobile,
                address: updatedUser.address,
                coins: updatedUser.coins || 0
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get saved products (wishlist)
// @route   GET /api/users/profile/saved-products
// @access  Private
export const getSavedProducts = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate('savedProducts');

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        res.status(200).json({
            success: true,
            data: user.savedProducts || []
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle saved product (add/remove from wishlist)
// @route   POST /api/users/profile/saved-products
// @access  Private
export const toggleSavedProduct = async (req, res, next) => {
    try {
        const { productId } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        // Initialize savedProducts if it doesn't exist
        if (!user.savedProducts) {
            user.savedProducts = [];
        }

        // Check if product is already saved
        const index = user.savedProducts.indexOf(productId);

        if (index > -1) {
            // Product exists, remove it
            user.savedProducts.splice(index, 1);
        } else {
            // Product doesn't exist, add it
            user.savedProducts.push(productId);
        }

        await user.save();

        // Return updated list
        const updatedUser = await User.findById(req.user._id).populate('savedProducts');

        res.status(200).json({
            success: true,
            data: updatedUser.savedProducts
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Forgot Password - Send reset email
// @route   POST /api/users/forgotpassword
// @access  Public
// @desc    Forgot Password - Send reset email
// @route   POST /api/users/forgotpassword
// @access  Public
export const forgotPassword = async (req, res, next) => {
    // console.log('🔹 forgotPassword Request Received:', req.body.email); // Keep logs for debug but maybe reduce verbosity in prod
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            console.log('ℹ️ Forgot Password: User not found for email:', req.body.email);
            // SECURITY: Return success to prevent email enumeration
            return res.status(200).json({
                success: true,
                data: 'If an account with that email exists, we have sent a password reset link.'
            });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        // Create reset url
        const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

        // DEBUG: Log URL to console (REMOVE IN PRODUCTION)
        if (process.env.NODE_ENV !== 'production') {
            console.log('🔗 MANUAL RESET LINK:', resetUrl);
        }

        try {
            await sendPasswordResetEmail(user.email, resetUrl);

            res.status(200).json({
                success: true,
                data: 'If an account with that email exists, we have sent a password reset link.'
            });
        } catch (error) {
            console.error('❌ Email Sending Failed:', error);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });

            // In case of email error, we *could* still return success to mask it, 
            // but for now, 500 is okay as it indicates a server fault, not user existence.
            res.status(500);
            throw new Error('Email server error. Please try again later.');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Reset Password
// @route   PUT /api/users/resetpassword/:resettoken
// @access  Public
export const resetPassword = async (req, res, next) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            res.status(400);
            throw new Error('Invalid token');
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};

// @desc    Test Email Configuration
// @route   GET /api/users/test-email
// @access  Public
export const testEmailController = async (req, res) => {
    try {
        console.log('🧪 Testing Email Configuration...');
        const result = await sendPasswordResetEmail(
            process.env.EMAIL_USER || 'test@example.com',
            'http://test-url.com'
        );
        res.json({
            success: true,
            message: 'Email should have been sent!',
            config: {
                user: process.env.EMAIL_USER,
                hasPass: !!process.env.EMAIL_PASS,
                admin: process.env.ADMIN_EMAIL
            },
            result
        });
    } catch (error) {
        console.error('❌ Test Email Failed:', error);
        res.status(500).json({
            success: false,
            message: 'Email Sending Failed',
            error: error.message,
            stack: error.stack,
            config: {
                user: process.env.EMAIL_USER,
                hasPass: !!process.env.EMAIL_PASS
            }
        });
    }
};


