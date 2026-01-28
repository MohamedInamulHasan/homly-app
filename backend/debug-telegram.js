import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const testTelegram = async () => {
    console.log('📱 Testing Telegram Notification...');

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    console.log(`Debug Info:`);
    console.log(`- Token: ${token ? token.substring(0, 10) + '...' : 'MISSING'}`);
    console.log(`- Chat ID: ${chatId}`);

    if (!token || !chatId) {
        console.error('❌ Error: Missing credentials in .env file!');
        return;
    }

    const message = `
🚀 <b>Test Success!</b>
------------------
Your Telegram notifications are working perfectly.
You will now receive alerts here for every new order.

<i>Time: ${new Date().toLocaleTimeString()}</i>
`.trim();

    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    try {
        console.log('\n🚀 Sending request to Telegram...');
        const res = await axios.post(url, {
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML'
        });

        if (res.data.ok) {
            console.log('✅ Message sent successfully! Check your Telegram.');
        } else {
            console.log('❌ Telegram API returned error:', res.data);
        }
    } catch (error) {
        console.error('❌ Failed to send message:', error.response?.data || error.message);
    }
};

testTelegram();
