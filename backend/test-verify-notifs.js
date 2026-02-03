
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();

console.log('--- Config Verification ---');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? 'Set' : 'Missing');
console.log('TELEGRAM_CHAT_ID:', process.env.TELEGRAM_CHAT_ID);
console.log('---------------------------');

// Mock objects
const mockOrder = {
    _id: 'TestOrder_MANUAL',
    total: 1000,
    shipping: 50,
    status: 'Pending',
    createdAt: new Date(),
    shippingAddress: {
        name: 'Admin Test',
        mobile: '9876543210',
        street: 'Backend Lab',
        city: 'Debug City',
        zip: '00000'
    },
    items: [
        { name: 'Debug Widget', quantity: 1, price: 500, storeId: { name: 'Debug Store' } }
    ],
    user: {
        name: 'Admin Tester',
        email: 'test@example.com'
    },
    paymentMethod: { type: 'COD' }
};

const startTest = async () => {
    try {
        const { sendOrderNotificationEmail } = await import('./src/services/emailService.js');
        const { sendOrderTelegramNotification } = await import('./src/services/telegramService.js');

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
        console.error('Execution Error:', err);
    }
};

startTest();
