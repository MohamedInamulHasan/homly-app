import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

// Product Schema (simplified for update)
const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema);

const toggleProduct = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find a product
        const product = await Product.findOne();
        if (!product) {
            console.log('❌ No products found');
            process.exit(1);
        }

        console.log(`Initial Status for "${product.title}":`, product.isAvailable);

        // Toggle
        product.isAvailable = false;
        // We explicitly set to false to test "Out of Stock"
        // If it was already false, we'd set to true, but let's force false to verify UI
        await Product.updateOne({ _id: product._id }, { $set: { isAvailable: false } });

        console.log(`✅ Updated "${product.title}" to isAvailable: false`);
        console.log(`ℹ️ Check frontend to see if it says "Out of Stock"`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

toggleProduct();
