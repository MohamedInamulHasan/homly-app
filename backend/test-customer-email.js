import dotenv from 'dotenv';
dotenv.config();

import { sendCustomerOrderConfirmationEmail } from './src/services/emailService.js';

// Mock order object with customer email
const mockOrder = {
    _id: '507f1f77bcf86cd799439011',
    createdAt: new Date(),
    items: [
        {
            name: 'Fresh Vegetables',
            quantity: 2,
            price: 150,
            isFromAd: false,
            storeId: { name: 'Green Grocers' }
        },
        {
            name: 'Organic Fruits',
            quantity: 1,
            price: 200,
            isFromAd: true,
            storeId: { name: 'Organic Store' }
        }
    ],
    total: 520,
    shipping: 20,
    shippingAddress: {
        name: 'Mohamed Inamul Hasan',
        street: '123 Test Street, Apartment 4B',
        city: 'Bangalore',
        zip: '560001',
        mobile: '9876543210',
        location: 'https://www.google.com/maps?q=12.9716,77.5946'
    },
    paymentMethod: {
        type: 'Cash on Delivery'
    },
    user: {
        name: 'Mohamed Inamul Hasan',
        email: 'mohamedinamulhasan0@gmail.com'
    },
    scheduledDeliveryTime: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
};

console.log('🧪 Testing CUSTOMER order confirmation email...\n');

sendCustomerOrderConfirmationEmail(mockOrder)
    .then(result => {
        console.log('\n✅ Test completed!');
        console.log('Result:', result);
        console.log('\n📬 Check your email:', mockOrder.user.email);
    })
    .catch(error => {
        console.log('\n❌ Test failed!');
        console.error('Error:', error.message);
    });
