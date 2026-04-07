import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './src/models/Order.js';

dotenv.config();

const checkLinks = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const orders = await Order.find({ 'shippingAddress.location': { $exists: true, $ne: '' } }).sort({ createdAt: -1 }).limit(5);
        console.log(orders.map(o => ({ 
            id: o._id, 
            time: o.createdAt, 
            location: o.shippingAddress.location 
        })));
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkLinks();
