import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.js';
import Store from './src/models/Store.js';

dotenv.config();

const updateProductsWithStores = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
        });
        console.log('✅ Connected to MongoDB');

        // Get all stores
        const stores = await Store.find();
        console.log(`📦 Found ${stores.length} stores in database`);

        if (stores.length === 0) {
            console.log('⚠️  No stores found. Creating a default store...');

            const defaultStore = await Store.create({
                name: 'ShopEase Store',
                image: 'https://images.unsplash.com/photo-1555421689-d68471e189f2?w=600',
                category: 'General',
                location: 'Main Street',
                rating: 4.5,
                phone: '1234567890',
                description: 'Your one-stop shop for all products'
            });

            stores.push(defaultStore);
            console.log('✅ Created default store');
        }

        // Get all products
        const products = await Product.find();
        console.log(`📦 Found ${products.length} products`);

        // Update each product with a store reference
        let updated = 0;
        for (const product of products) {
            if (!product.storeId) {
                // Assign store based on category or use first store
                let assignedStore = stores[0]; // Default to first store

                // Try to match by category
                const matchingStore = stores.find(s =>
                    s.category?.toLowerCase() === product.category?.toLowerCase()
                );

                if (matchingStore) {
                    assignedStore = matchingStore;
                }

                product.storeId = assignedStore._id;
                await product.save();
                updated++;
                console.log(`✅ Updated "${product.title}" → Store: "${assignedStore.name}"`);
            }
        }

        console.log(`\n✅ Updated ${updated} products with store references`);

        await mongoose.connection.close();
        console.log('✅ Complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

updateProductsWithStores();
