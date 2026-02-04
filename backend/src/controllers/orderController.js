import Order from '../models/Order.js';
import User from '../models/User.js';
import { sendOrderNotificationEmail } from '../services/emailService.js';
import { sendOrderTelegramNotification } from '../services/telegramService.js';


// @desc    Create new order
// @route   POST /api/orders
// @access  Public
export const createOrder = async (req, res, next) => {
    try {
        const {
            items,
            shippingAddress,
            paymentMethod,
            subtotal,
            shipping,
            tax,
            discount,
            total,
            scheduledDeliveryTime
        } = req.body;

        if (!items || items.length === 0) {
            res.status(400);
            throw new Error('No order items');
        }

        console.log('📦 Creating new order for user:', req.user?._id);

        // Check for bonus coins (Free Delivery)
        let finalShipping = shipping;
        let finalTotal = total;

        // Check for Gold Products (Free Delivery) & persist isGold status
        // Verify from DB to ensure integrity
        const productIds = items.map(item => item.product || item.id);
        const dbProducts = await import('../models/Product.js').then(m => m.default.find({ _id: { $in: productIds } }).select('isGold'));

        // Prepare final items with persistent isGold status
        const finalItems = items.map(item => {
            const pId = (item.product || item.id).toString();
            const dbProduct = dbProducts.find(p => p._id.toString() === pId);
            return {
                ...item,
                isGold: dbProduct ? dbProduct.isGold : false
            };
        });

        const hasGoldProduct = dbProducts.some(p => p.isGold);

        if (hasGoldProduct) {
            console.log('⚡ Gold Product found in order. Waiving delivery charge.');
            finalShipping = 0;
            // No need to deduct coins if Gold Product is present
            // Recalculate total if shipping was included
            finalTotal = Number(subtotal) + Number(tax) - Number(discount);
        } else if (req.user?._id) {
            // Check for bonus coins (Free Delivery) if NOT Gold
            const user = await User.findById(req.user._id);
            if (user && user.coins > 0 && Number(shipping) > 0) {
                console.log(`💰 User ${user._id} used 1 coin for free delivery. Remaining: ${user.coins - 1}`);
                user.coins -= 1;
                await user.save();

                // Adjust order totals
                finalShipping = 0;
                finalTotal = Number(subtotal) + Number(tax) - Number(discount); // Recalculate total without shipping
            }
        }

        const order = await Order.create({
            user: req.user?._id, // Optional for guest checkout
            items: finalItems,
            shippingAddress,
            paymentMethod,
            subtotal,
            shipping: finalShipping,
            tax,
            discount,
            total: finalTotal,
            scheduledDeliveryTime
        });

        // Update user profile with latest shipping address for autofill
        if (req.user?._id) {
            try {
                await User.findByIdAndUpdate(req.user._id, {
                    mobile: shippingAddress.mobile,
                    address: {
                        street: shippingAddress.street,
                        city: shippingAddress.city,
                        state: shippingAddress.state,
                        zip: shippingAddress.zip,
                        country: shippingAddress.country || 'India'
                    }
                });
            } catch (err) {
                console.error('Failed to auto-save user address:', err);
                // Don't fail the order if address save fails
            }
        }

        console.log('✅ Order created successfully:', order._id);

        // Populate store and user details for email
        // We need deep population for store name in items
        await order.populate([
            { path: 'items.storeId', select: 'name' },
            { path: 'user', select: 'name email location' }
        ]);

        // Send email notification to admin (non-blocking)
        console.log('📧 Attempting to send order notification email...');
        sendOrderNotificationEmail(order)
            .then(result => console.log('📧 Email service result:', result))
            .catch(err => console.error('❌ Failed to send email notification:', err));

        // Send Telegram notification to admin (non-blocking)
        console.log('📱 Attempting to send Telegram notification...');
        sendOrderTelegramNotification(order)
            .then(result => console.log('📱 Telegram service result:', result))
            .catch(err => console.error('❌ Failed to send Telegram notification:', err));

        res.status(201).json({
            success: true,
            data: order
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
export const getOrders = async (req, res, next) => {
    try {
        // If user is admin, return all orders
        // If user is customer, return only their orders
        let query = {};

        if (req.user && req.user.role === 'admin') {
            query = {}; // Admin sees all orders
        } else if (req.user && req.user.role === 'store_admin' && req.user.storeId) {
            // Store Admin sees:
            // 1. Orders containing items from their store (Sales)
            // 2. Orders they placed themselves (Purchases)
            query = {
                $or: [
                    { 'items.storeId': req.user.storeId },
                    { user: req.user._id }
                ]
            };
        } else {
            // Customer sees only their orders
            query = { user: req.user._id };
        }

        const orders = await Order.find(query)
            .select('items.product items.name items.image items.storeId items.quantity items.price items.isGold total status createdAt user shippingAddress paymentMethod shipping') // Added items.image and items.isGold
            .populate({
                path: 'items.product',
                select: 'title', // Removed image from populate
                options: { lean: true } // Populate efficiently
            })
            .populate({
                path: 'items.storeId',
                select: 'name',
                options: { lean: true }
            })
            .populate({
                path: 'user',
                select: 'name email mobile',
                options: { lean: true }
            })
            .sort({ createdAt: -1 })
            .lean(); // Convert to plain JavaScript objects

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.product', 'title price isGold') // Removed image, added isGold
            .populate('items.storeId', 'name')
            .lean();

        if (!order) {
            res.status(404);
            throw new Error('Order not found');
        }

        // Check if the order belongs to the requesting user
        // Note: With lean(), order.user is an ObjectId, so we use string comparison
        const isOwner = order.user.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';

        let isStoreAdmin = false;
        if (req.user.role === 'store_admin' && req.user.storeId) {
            // Check if any item in the order belongs to this store
            // Note: items.storeId is populated in the query above as an object { _id, name }
            isStoreAdmin = order.items.some(item =>
                item.storeId && (item.storeId._id || item.storeId).toString() === req.user.storeId.toString()
            );
        }

        if (!isAdmin && !isOwner && !isStoreAdmin) {
            res.status(403);
            throw new Error('Not authorized to view this order');
        }

        res.status(200).json({
            success: true,
            data: order
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private/Admin
export const updateOrderStatus = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            res.status(404);
            throw new Error('Order not found');
        }

        // Check if we are cancelling the order
        if (req.body.status === 'Cancelled' && order.status !== 'Cancelled') {
            console.log(`❌ Cancelling order ${order._id}. Current shipping: ${order.shipping}, Status: ${order.status}`);
            // Check if coins were used (implied by shipping === 0)
            // But verify it wasn't a Gold Order
            const isGoldOrder = order.items.some(item => item.isGold) ||
                (await import('../models/Product.js').then(m => m.default.find({ _id: { $in: order.items.map(i => i.product) } }).select('isGold'))).some(p => p.isGold);

            if (order.shipping === 0 && !isGoldOrder) {
                const user = await User.findById(order.user);
                if (user) {
                    const oldCoins = user.coins || 0;
                    user.coins = oldCoins + 1;
                    await user.save();
                    console.log(`💰 Refunded 1 coin to user ${user._id} | ${oldCoins} -> ${user.coins} | Order: ${order._id}`);
                } else {
                    console.error(`⚠️ User ${order.user} not found for coin refund.`);
                }
            } else {
                console.log(`ℹ️ No coin refund needed (Shipping: ${order.shipping}).`);
            }
        }

        order.status = req.body.status || order.status;

        if (req.body.status === 'Delivered') {
            order.deliveredAt = Date.now();
        }

        const updatedOrder = await order.save();

        res.status(200).json({
            success: true,
            data: updatedOrder
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private
export const deleteOrder = async (req, res, next) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            res.status(404);
            throw new Error('Order not found');
        }

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        next(error);
    }
};
