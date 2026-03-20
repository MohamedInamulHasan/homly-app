import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.js';
import Store from './src/models/Store.js';
import Category from './src/models/Category.js';
import Service from './src/models/Service.js';

dotenv.config();

const sampleCategories = [
    { name: 'Electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800' },
    { name: 'Fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b830c6050?w=800' },
    { name: 'Home', image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800' },
    { name: 'Sports', image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800' }
];

const sampleProducts = [
    {
        title: "Wireless Headphones",
        price: 2999,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
        category: "Electronics",
        description: "High-quality wireless headphones with noise cancellation",
        stock: 50,
        featured: true
    },
    {
        title: "Smart Watch",
        price: 4999,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
        category: "Electronics",
        description: "Feature-rich smartwatch with health tracking",
        stock: 30,
        featured: true
    },
    {
        title: "Running Shoes",
        price: 3499,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
        category: "Fashion",
        description: "Comfortable running shoes for daily exercise",
        stock: 100
    }
];

const sampleServices = [
    { name: 'Home Cleaning', description: 'Professional deep cleaning services for your home.', price: 999, image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6958?w=800' },
    { name: 'AC Repair', description: 'Expert AC repair and maintenance services.', price: 499, image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7bc3?w=800' }
];

const seedDB = async () => {
    try {
        console.log('⏳ Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if we have stores
        const stores = await Store.find({});
        if (stores.length === 0) {
            console.log('⚠️ No stores found. Products will have no storeId.');
        } else {
            console.log(`🏪 Found ${stores.length} stores.`);
        }

        // Add storeId to products if stores exist
        const productsWithStore = sampleProducts.map(p => ({
            ...p,
            storeId: stores.length > 0 ? stores[0]._id : undefined
        }));

        console.log('🧹 Clearing existing data...');
        await Product.deleteMany({});
        await Category.deleteMany({});
        await Service.deleteMany({});

        console.log('🌱 Seeding products...');
        await Product.insertMany(productsWithStore);
        console.log(`✅ Seeded ${productsWithStore.length} products.`);

        console.log('🌱 Seeding categories...');
        await Category.insertMany(sampleCategories);
        console.log(`✅ Seeded ${sampleCategories.length} categories.`);

        console.log('🌱 Seeding services...');
        await Service.insertMany(sampleServices);
        console.log(`✅ Seeded ${sampleServices.length} services.`);

        await mongoose.connection.close();
        console.log('👋 Database connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
};

seedDB();
