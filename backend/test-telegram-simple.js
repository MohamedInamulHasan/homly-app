import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

console.log('🧪 Simple Telegram Test (using native https module)\n');
console.log('Token:', token ? token.substring(0, 15) + '...' : 'MISSING');
console.log('Chat ID:', chatId || 'MISSING');
console.log('');

if (!token || !chatId) {
    console.error('❌ Missing credentials!');
    process.exit(1);
}

const message = encodeURIComponent('🧪 Test from Homly Backend - ' + new Date().toLocaleTimeString());
const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${message}`;

console.log('📤 Sending GET request to Telegram API...');
console.log('URL:', url.substring(0, 50) + '...');
console.log('');

https.get(url, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('✅ Response received!');
        console.log('Status Code:', res.statusCode);
        console.log('Response:', data);

        try {
            const json = JSON.parse(data);
            if (json.ok) {
                console.log('\n✨ SUCCESS! Check your Telegram for the message.');
            } else {
                console.log('\n❌ API returned error:', json);
            }
        } catch (e) {
            console.log('\n⚠️ Could not parse response as JSON');
        }
    });
}).on('error', (err) => {
    console.error('❌ Request failed:', err.message);
    console.error('Error code:', err.code);
});

// Set timeout
setTimeout(() => {
    console.log('\n⏱️ Test completed (or timed out after 10 seconds)');
}, 10000);
