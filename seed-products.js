// Seed localStorage with sample products for immediate functionality
const sampleProducts = [
    {
        _id: "1",
        title: "Wireless Headphones",
        price: 2999,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
        category: "Electronics",
        description: "High-quality wireless headphones with noise cancellation",
        stock: 50
    },
    {
        _id: "2",
        title: "Smart Watch",
        price: 4999,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
        category: "Electronics",
        description: "Feature-rich smartwatch with health tracking",
        stock: 30
    },
    {
        _id: "3",
        title: "Running Shoes",
        price: 3499,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
        category: "Fashion",
        description: "Comfortable running shoes for daily exercise",
        stock: 100
    },
    {
        _id: "4",
        title: "Coffee Maker",
        price: 5999,
        image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400",
        category: "Home",
        description: "Automatic coffee maker with timer",
        stock: 25
    },
    {
        _id: "5",
        title: "Backpack",
        price: 1999,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
        category: "Fashion",
        description: "Durable backpack for travel and daily use",
        stock: 75
    },
    {
        _id: "6",
        title: "Desk Lamp",
        price: 1499,
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400",
        category: "Home",
        description: "LED desk lamp with adjustable brightness",
        stock: 40
    },
    {
        _id: "7",
        title: "Bluetooth Speaker",
        price: 2499,
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400",
        category: "Electronics",
        description: "Portable Bluetooth speaker with great sound",
        stock: 60
    },
    {
        _id: "8",
        title: "Yoga Mat",
        price: 999,
        image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400",
        category: "Sports",
        description: "Non-slip yoga mat for home workouts",
        stock: 80
    }
];

console.log('🌱 Seeding localStorage with sample products...');
localStorage.setItem('products', JSON.stringify(sampleProducts));
console.log(`✅ Seeded ${sampleProducts.length} products to localStorage`);
console.log('📦 Products are now available offline!');
console.log('\n🔄 Refresh the page to see products load immediately!');
