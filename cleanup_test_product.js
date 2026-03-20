import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'backend', '.env') });

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const productSchema = new mongoose.Schema({ title: String }, { strict: false });
        const Product = mongoose.model('Product', productSchema);

        const result = await Product.deleteMany({ title: /utuytg/i });
        console.log(`Deleted ${result.deletedCount} products matching 'utuytg'`);

        await mongoose.disconnect();
        console.log('Disconnected');
    } catch (err) {
        console.error(err);
    }
}

cleanup();
