
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from './src/models/Product.js';

// Load env vars
dotenv.config();

// Fix __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectDB = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        console.log('   URI:', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + '...' : 'UNDEFINED');

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected to database:', mongoose.connection.name);

        // Count products
        const count = await Product.countDocuments({});
        console.log(`📊 Total Products in DB: ${count}`);

        if (count > 0) {
            const products = await Product.find({}).select('title category').limit(5);
            console.log('📝 First 5 Products:', products);
        } else {
            console.log('❌ No products found in this database!');
        }

        process.exit();
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
};

connectDB();
