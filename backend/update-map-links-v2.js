import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './src/models/Order.js';

dotenv.config();

const updateLinks = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const orders = await Order.find({ 'shippingAddress.location': { $exists: true, $ne: '' } });
        console.log(`Found ${orders.length} orders to check.`);

        let updatedCount = 0;

        for (const order of orders) {
            const oldLink = order.shippingAddress.location;
            
            // Extract lat/lng from various formats
            // Format 1: maps?q=lat,lng
            // Format 2: maps/search/?api=1&query=lat,lng
            const coordMatch = oldLink.match(/q(?:uery)?=([-.\d]+),([-.\d]+)/);
            
            if (coordMatch) {
                const lat = coordMatch[1];
                const lng = coordMatch[2];
                const newLink = `https://www.google.com/maps/place/${lat}+${lng}/@${lat},${lng},17z`;
                
                if (newLink !== oldLink) {
                    await Order.findByIdAndUpdate(order._id, {
                        $set: { 'shippingAddress.location': newLink }
                    });
                    updatedCount++;
                }
            }
        }

        console.log(`Successfully updated ${updatedCount} orders to the robust /place/ format.`);
        process.exit(0);
    } catch (error) {
        console.error('Update failed:', error);
        process.exit(1);
    }
};

updateLinks();
