
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars from backend/.env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

console.log('--- Config Verification ---');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? 'Set' : 'Missing');
console.log('TELEGRAM_CHAT_ID:', process.env.TELEGRAM_CHAT_ID);
console.log('---------------------------');

// Mock objects
const mockOrder = {
    _id: 'TEST_ORDER_12345',
    total: 1000,
    shipping: 50,
    status: 'Pending',
    createdAt: new Date(),
    shippingAddress: {
        name: 'Test User',
        mobile: '1234567890',
        street: '123 Test St',
        city: 'Test City',
        zip: '12345'
    },
    items: [
        { name: 'Test Product', quantity: 2, price: 500, storeId: { name: 'Test Store' } }
    ],
    user: {
        name: 'Test User',
        email: 'test@example.com'
    },
    paymentMethod: { type: 'COD' }
};

const mockServiceRequest = {
    _id: 'TEST_REQ_123',
    status: 'Pending',
    createdAt: new Date(),
    user: {
        name: 'Test Service User',
        email: 'test@example.com',
        mobile: '9876543210'
    },
    service: {
        name: 'Plumbing',
        description: 'Leaky faucet',
        address: '456 Service Lane',
        mobile: '1122334455'
    }
};

// Import services dynamically to use loaded env
const startTest = async () => {
    try {
        const { sendOrderNotificationEmail, sendServiceRequestNotification } = await import('../backend/src/services/emailService.js');
        const { sendOrderTelegramNotification, sendServiceRequestTelegramNotification } = await import('../backend/src/services/telegramService.js');

        console.log('\nTesting Order Email...');
        await sendOrderNotificationEmail(mockOrder)
            .then(res => console.log('✅ Email Success:', res))
            .catch(err => console.error('❌ Email Failed:', err));

        console.log('\nTesting Order Telegram...');
        await sendOrderTelegramNotification(mockOrder)
            .then(res => console.log('✅ Telegram Success:', res))
            .catch(err => console.error('❌ Telegram Failed:', err));

        console.log('Test completed.');
    } catch (err) {
        console.error('Import/Execution Error:', err);
    }
};

startTest();
