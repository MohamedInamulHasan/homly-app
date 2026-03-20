import dotenv from 'dotenv';
dotenv.config();

import { sendOrderNotificationEmail } from './src/services/emailService.js';

// Mock order object
const mockOrder = {
    _id: '507f1f77bcf86cd799439011',
    items: [
        {
            name: 'Test Product',
            quantity: 2,
            price: 100,
            isFromAd: false,
            storeId: { name: 'Test Store' }
        }
    ],
    total: 220,
    shipping: 20,
    shippingAddress: {
        name: 'Test Customer',
        street: '123 Test Street',
        city: 'Test City',
        zip: '123456',
        mobile: '9876543210',
        location: 'https://www.google.com/maps?q=12.9716,77.5946'
    },
    paymentMethod: {
        type: 'Cash on Delivery'
    },
    user: {
        name: 'Test Customer',
        email: 'test@example.com'
    },
    scheduledDeliveryTime: new Date()
};

console.log('🧪 Testing email service with mock order...\n');

sendOrderNotificationEmail(mockOrder)
    .then(result => {
        console.log('\n✅ Test completed successfully!');
        console.log('Result:', result);
    })
    .catch(error => {
        console.log('\n❌ Test failed!');
        console.error('Error:', error.message);
    });
