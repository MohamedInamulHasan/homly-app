import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.js';

dotenv.config();

const checkAvailability = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const total = await Product.countDocuments();
        const available = await Product.countDocuments({ isAvailable: true });
        const unavailable = await Product.countDocuments({ isAvailable: false });
        const noStore = await Product.countDocuments({ storeId: { $exists: false } });

        console.log(`Total Products: ${total}`);
        console.log(`Available: ${available}`);
        console.log(`Unavailable: ${unavailable}`);
        console.log(`Products without storeId: ${noStore}`);

        if (available > 0) {
            const sample = await Product.findOne({ isAvailable: true });
            console.log('\nSample Available Product:');
            console.log(`  Title: ${sample.title}`);
            console.log(`  Category: ${sample.category}`);
            console.log(`  StoreId: ${sample.storeId}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

checkAvailability();
