import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './src/models/Order.js';
import Product from './src/models/Product.js';

dotenv.config();

const syncSalesCount = async () => {
    try {
        console.log('⏳ Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        console.log('⏳ Calculating sales counts from orders...');
        const orders = await Order.find({});
        const salesMap = {};

        orders.forEach(order => {
            if (order.status !== 'Cancelled') {
                order.items.forEach(item => {
                    const productId = (item.product || item.id).toString();
                    salesMap[productId] = (salesMap[productId] || 0) + (item.quantity || 1);
                });
            }
        });

        console.log(`📊 Found sales for ${Object.keys(salesMap).length} products`);

        const bulkOps = Object.keys(salesMap).map(productId => ({
            updateOne: {
                filter: { _id: productId },
                update: { $set: { salesCount: salesMap[productId] } }
            }
        }));

        if (bulkOps.length > 0) {
            console.log('⏳ Updating products...');
            await Product.bulkWrite(bulkOps);
            console.log('✅ Successfully updated salesCount for all products');
        } else {
            console.log('ℹ️ No sales data to update');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error syncing sales counts:', error);
        process.exit(1);
    }
};

syncSalesCount();
