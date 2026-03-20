import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.js';

dotenv.config();

const sampleProducts = [
    {
        title: "Premium Wireless Headphones",
        price: 2999,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600",
        category: "Electronics",
        description: "High-quality wireless headphones with active noise cancellation and 30-hour battery life",
        stock: 50,
        featured: true
    },
    {
        title: "Smart Watch Pro",
        price: 4999,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
        category: "Electronics",
        description: "Feature-rich smartwatch with health tracking, GPS, and water resistance",
        stock: 30,
        featured: true
    },
    {
        title: "Running Shoes Elite",
        price: 3499,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600",
        category: "Fashion",
        description: "Comfortable running shoes with advanced cushioning for daily exercise",
        stock: 100,
        featured: false
    },
    {
        title: "Automatic Coffee Maker",
        price: 5999,
        image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600",
        category: "Home",
        description: "Programmable coffee maker with built-in grinder and thermal carafe",
        stock: 25,
        featured: true
    },
    {
        title: "Travel Backpack",
        price: 1999,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600",
        category: "Fashion",
        description: "Durable backpack with laptop compartment, perfect for travel and daily use",
        stock: 75,
        featured: false
    },
    {
        title: "LED Desk Lamp",
        price: 1499,
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600",
        category: "Home",
        description: "Adjustable LED desk lamp with multiple brightness levels and USB charging port",
        stock: 40,
        featured: false
    },
    {
        title: "Portable Bluetooth Speaker",
        price: 2499,
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600",
        category: "Electronics",
        description: "Waterproof Bluetooth speaker with 360-degree sound and 12-hour battery",
        stock: 60,
        featured: true
    },
    {
        title: "Premium Yoga Mat",
        price: 999,
        image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600",
        category: "Sports",
        description: "Non-slip yoga mat with extra cushioning for comfortable workouts",
        stock: 80,
        featured: false
    },
    {
        title: "Wireless Mouse",
        price: 799,
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600",
        category: "Electronics",
        description: "Ergonomic wireless mouse with precision tracking and long battery life",
        stock: 120,
        featured: false
    },
    {
        title: "Stainless Steel Water Bottle",
        price: 599,
        image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600",
        category: "Sports",
        description: "Insulated water bottle keeps drinks cold for 24 hours, hot for 12 hours",
        stock: 150,
        featured: false
    }
];

const seedDatabase = async () => {
    try {
        console.log('🌱 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
        });
        console.log('✅ Connected to MongoDB');

        console.log('🗑️  Clearing existing products...');
        await Product.deleteMany({});
        console.log('✅ Cleared existing products');

        console.log('📦 Seeding products...');
        const products = await Product.insertMany(sampleProducts);
        console.log(`✅ Successfully seeded ${products.length} products to MongoDB!`);

        console.log('\n📊 Products in database:');
        products.forEach((p, i) => {
            console.log(`  ${i + 1}. ${p.title} - ₹${p.price}`);
        });

        await mongoose.connection.close();
        console.log('\n✅ Database seeding complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
