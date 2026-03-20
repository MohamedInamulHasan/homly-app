import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendOrderNotificationEmail } from './src/services/emailService.js';
import { sendOrderTelegramNotification } from './src/services/telegramService.js';

// Load env vars
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('🧪 Testing Order Notification Services\n');
console.log('='.repeat(50));
console.log('Environment Check:');
console.log('- SMTP_HOST:', process.env.SMTP_HOST || '❌ Not Set');
console.log('- SMTP_USER:', process.env.SMTP_USER ? '✅ Set' : '❌ Not Set');
console.log('- SMTP_PASS:', process.env.SMTP_PASS ? '✅ Set' : '❌ Not Set');
console.log('- EMAIL_USER:', process.env.EMAIL_USER || '❌ Not Set');
console.log('- ADMIN_EMAIL:', process.env.ADMIN_EMAIL || '❌ Not Set');
console.log('- TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? '✅ Set' : '❌ Not Set');
console.log('- TELEGRAM_CHAT_ID:', process.env.TELEGRAM_CHAT_ID || '❌ Not Set');
console.log('='.repeat(50));
console.log('');

// Create a mock order object
const mockOrder = {
    _id: '507f1f77bcf86cd799439011',
    user: {
        name: 'Test User',
        email: 'testuser@example.com'
    },
    items: [
        {
            name: 'Test Product 1',
            quantity: 2,
            price: 500,
            storeId: {
                name: 'Test Store'
            }
        },
        {
            name: 'Test Product 2',
            quantity: 1,
            price: 300,
            storeId: {
                name: 'Another Store'
            }
        }
    ],
    shippingAddress: {
        name: 'John Doe',
        mobile: '9876543210',
        street: '123 Test Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zip: '400001'
    },
    paymentMethod: {
        type: 'Cash on Delivery'
    },
    subtotal: 1300,
    shipping: 0, // Free delivery (coin applied)
    tax: 0,
    discount: 0,
    total: 1300,
    status: 'Pending',
    createdAt: new Date(),
    scheduledDeliveryTime: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
};

async function testNotifications() {
    console.log('📧 Testing Email Notification...\n');

    try {
        const emailResult = await sendOrderNotificationEmail(mockOrder);
        console.log('✅ Email Test Result:', emailResult);
        console.log('');
    } catch (error) {
        console.error('❌ Email Test Failed:');
        console.error('   Error:', error.message);
        if (error.code) console.error('   Code:', error.code);
        if (error.response) console.error('   Response:', error.response);
        console.log('');
    }

    console.log('📱 Testing Telegram Notification...\n');

    try {
        const telegramResult = await sendOrderTelegramNotification(mockOrder);
        console.log('✅ Telegram Test Result:', telegramResult);
        console.log('');
    } catch (error) {
        console.error('❌ Telegram Test Failed:');
        console.error('   Error:', error.message);
        if (error.response?.data) {
            console.error('   API Response:', JSON.stringify(error.response.data, null, 2));
        }
        console.log('');
    }

    console.log('='.repeat(50));
    console.log('✨ Test Complete!');
    console.log('='.repeat(50));
}

testNotifications();
