import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './src/models/Order.js';

dotenv.config();

const updateLinks = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find all orders with the old link format
        const ordersWithOldLinks = await Order.find({ 
            'shippingAddress.location': { $regex: /www\.google\.com\/maps\/search/ } 
        });

        console.log(`Found ${ordersWithOldLinks.length} orders with old map link format.`);

        let updatedCount = 0;

        for (const order of ordersWithOldLinks) {
            const oldLink = order.shippingAddress.location;
            const newLink = oldLink.replace('https://www.google.com/maps/search/?api=1&query=', 'https://maps.google.com/maps?q=');
            
            if (newLink !== oldLink) {
                await Order.findByIdAndUpdate(order._id, {
                    $set: { 'shippingAddress.location': newLink }
                });
                updatedCount++;
            }
        }

        console.log(`Successfully updated ${updatedCount} orders to the stable map link format.`);
        process.exit(0);
    } catch (error) {
        console.error('Update failed:', error);
        process.exit(1);
    }
};

updateLinks();
