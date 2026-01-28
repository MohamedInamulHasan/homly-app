// Script to add scheduledDeliveryTime to existing orders
// This will set a default delivery time for all orders that don't have one

const mongoose = require('mongoose');
require('dotenv').config();

const Order = require('./src/models/Order');

const updateExistingOrders = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find all orders without scheduledDeliveryTime
        const ordersWithoutTime = await Order.find({
            $or: [
                { scheduledDeliveryTime: { $exists: false } },
                { scheduledDeliveryTime: null }
            ]
        });

        console.log(`📦 Found ${ordersWithoutTime.length} orders without scheduled delivery time`);

        if (ordersWithoutTime.length === 0) {
            console.log('✅ All orders already have scheduled delivery times!');
            process.exit(0);
        }

        // Update each order with a default delivery time (today at 6:00 PM)
        const defaultTime = new Date();
        defaultTime.setHours(18, 0, 0, 0); // 6:00 PM today

        for (const order of ordersWithoutTime) {
            // Set delivery time to order creation date + 2 hours, or default time
            const deliveryTime = order.createdAt
                ? new Date(new Date(order.createdAt).getTime() + 2 * 60 * 60 * 1000)
                : defaultTime;

            order.scheduledDeliveryTime = deliveryTime;
            await order.save();

            console.log(`✅ Updated order ${order._id} with delivery time: ${deliveryTime.toLocaleString()}`);
        }

        console.log(`\n🎉 Successfully updated ${ordersWithoutTime.length} orders!`);
        console.log('💡 Refresh your app to see the scheduled delivery times');

    } catch (error) {
        console.error('❌ Error updating orders:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
};

updateExistingOrders();
