import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import models
// Note: We need to point to the actual model files in the backend
const ProductSchema = new mongoose.Schema({
    title: String,
    storeId: mongoose.Schema.Types.ObjectId,
    category: String,
    price: Number,
}, { strict: false });

const Product = mongoose.model('Product', ProductSchema);

dotenv.config({ path: 'c:/Users/moham/ILAYANGUDI PROJECT/backend/.env' });

const checkTeaProducts = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const teaProducts = await Product.find({ title: /Tea/i });
        console.log(`📦 Found ${teaProducts.length} "Tea" products:`);
        
        teaProducts.forEach((p, index) => {
            console.log(`${index + 1}. ID: ${p._id}, Title: ${p.title}, StoreID: ${p.storeId}, Category: ${p.category}`);
        });

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

checkTeaProducts();
