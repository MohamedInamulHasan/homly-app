import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './src/models/Order.js';

dotenv.config();

const backfill = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Find all orders with missing location
        const incompleteOrders = await Order.find({ 
            $or: [
                { 'shippingAddress.location': { $exists: false } },
                { 'shippingAddress.location': '' },
                { 'shippingAddress.location': null }
            ]
        });

        console.log(`Found ${incompleteOrders.length} orders with missing GPS location.`);

        let updatedCount = 0;

        for (const order of incompleteOrders) {
            // 2. Find the most recent order from the same user that HAS a location
            const previousOrderWithLocation = await Order.findOne({
                user: order.user,
                'shippingAddress.location': { $ne: null, $ne: '' },
                _id: { $ne: order._id } // Don't match self
            }).sort({ createdAt: -1 });

            if (previousOrderWithLocation && previousOrderWithLocation.shippingAddress.location) {
                const rescuedLocation = previousOrderWithLocation.shippingAddress.location;
                
                // 3. Update the incomplete order
                await Order.findByIdAndUpdate(order._id, {
                    $set: { 'shippingAddress.location': rescuedLocation }
                });
                
                updatedCount++;
            }
        }

        console.log(`Successfully backfilled ${updatedCount} orders with previous GPS data.`);
        process.exit(0);
    } catch (error) {
        console.error('Backfill failed:', error);
        process.exit(1);
    }
};

backfill();
