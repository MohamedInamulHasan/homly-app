import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Store from './src/models/Store.js';

dotenv.config();

const checkStores = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const stores = await Store.find();
        console.log(`Total Stores: ${stores.length}`);

        stores.forEach(s => {
            console.log(`- ${s.name}: ${JSON.stringify(s.type)}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

checkStores();
