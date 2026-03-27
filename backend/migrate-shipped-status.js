import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './src/models/Order.js';

dotenv.config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const result = await Order.updateMany(
            { status: 'Shipped' },
            { $set: { status: 'Out for Delivery' } }
        );

        console.log(`Updated ${result.modifiedCount} orders from "Shipped" to "Out for Delivery".`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
