import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const testWhatsApp = async () => {
    console.log('📱 Testing WhatsApp Notification...');

    const phoneNumber = process.env.WHATSAPP_PHONE_NUMBER;
    const apiKey = process.env.WHATSAPP_API_KEY;

    console.log(`Debug Info:`);
    console.log(`- Phone: ${phoneNumber}`);
    console.log(`- API Key: ${apiKey}`);

    if (!phoneNumber || !apiKey || apiKey === 'REPLACE_WITH_YOUR_KEY') {
        console.error('\n❌ Error: Missing credentials in .env file!');
        console.log('Please obtain your API Key from CallMeBot and update backend/.env');
        console.log('Instructions: https://www.callmebot.com/blog/free-whatsapp-messages-api-integration/');
        return;
    }

    const message = `
🧪 *Test Message*
------------------
This is a test notification from your Homly Backend.
Time: ${new Date().toLocaleTimeString()}
------------------
`;

    const encodedMessage = encodeURIComponent(message.trim());
    const url = `https://api.callmebot.com/whatsapp.php?phone=${phoneNumber}&text=${encodedMessage}&apikey=${apiKey}`;

    try {
        console.log('\n🚀 Sending request to CallMeBot...');
        await axios.get(url);
        console.log('✅ Message sent successfully! Check your WhatsApp.');
    } catch (error) {
        console.error('❌ Failed to send message:', error.message);
        if (error.response) {
            console.error('Response Data:', error.response.data);
        }
    }
};

testWhatsApp();
