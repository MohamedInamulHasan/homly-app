import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

async function cleanup() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI not found in .env');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const productSchema = new mongoose.Schema({ title: String }, { strict: false });
        // Use the existing collection name if it's different, but standard is 'products'
        const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

        const result = await Product.deleteMany({ title: /utuytg/i });
        console.log(`Deleted ${result.deletedCount} products matching 'utuytg'`);

        await mongoose.disconnect();
        console.log('Disconnected');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

cleanup();
