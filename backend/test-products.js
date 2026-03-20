import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.js';

dotenv.config();

const testProducts = async () => {
    try {
        console.log('Connecting...');
        await mongoose.connect(process.env.MONGODB_URI, {});
        console.log('Connected to MongoDB');

        console.log('Counting products...');
        const count = await Product.countDocuments({});
        console.log(`Total products in database: ${count}`);

        if (count > 0) {
            console.log('Fetching ONE product...');
            const product = await Product.findOne({});
            console.log(`Found product: ${product.title}`);
            if (product.image) {
                console.log(`Image Type start: ${product.image.substring(0, 50)}`);
                console.log(`Image Length: ${product.image.length} chars`);
            } else {
                console.log('Image: undefined');
            }
            console.log(`ID: ${product._id}`);
        } else {
            console.log('⚠️  No products found in database!');
        }

        await mongoose.connection.close();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

testProducts();
