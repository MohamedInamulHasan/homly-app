import https from 'https';

// Your credentials from .env
const token = '8242210724:AAFhWQWJtQMFr_9lnraO5BVOs_o5VHOHAjE';
const chatId = '1299913002';

console.log('🧪 Testing Telegram Bot Directly\n');
console.log('Bot Token:', token.substring(0, 20) + '...');
console.log('Chat ID:', chatId);
console.log('');

// Test 1: Get bot info
console.log('📋 Test 1: Getting bot information...');
https.get(`https://api.telegram.org/bot${token}/getMe`, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.ok) {
                console.log('✅ Bot is valid!');
                console.log('   Bot Name:', json.result.username);
                console.log('   Bot ID:', json.result.id);
                console.log('');

                // Test 2: Send a test message
                console.log('📤 Test 2: Sending test message...');
                const message = encodeURIComponent('🧪 Test from Homly - ' + new Date().toLocaleTimeString());
                const sendUrl = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${message}`;

                https.get(sendUrl, (res2) => {
                    let data2 = '';
                    res2.on('data', (chunk) => data2 += chunk);
                    res2.on('end', () => {
                        try {
                            const json2 = JSON.parse(data2);
                            if (json2.ok) {
                                console.log('✅ Message sent successfully!');
                                console.log('   Message ID:', json2.result.message_id);
                                console.log('\n✨ Check your Telegram app!');
                            } else {
                                console.log('❌ Failed to send message:');
                                console.log('   Error:', json2.description);
                                console.log('   Error Code:', json2.error_code);

                                if (json2.error_code === 403) {
                                    console.log('\n⚠️  Bot is blocked! You need to:');
                                    console.log('   1. Open Telegram');
                                    console.log('   2. Search for your bot');
                                    console.log('   3. Click START or send /start');
                                }
                            }
                        } catch (e) {
                            console.log('❌ Could not parse response:', data2);
                        }
                    });
                }).on('error', (err) => {
                    console.error('❌ Network error:', err.message);
                });

            } else {
                console.log('❌ Invalid bot token!');
                console.log('   Error:', json.description);
            }
        } catch (e) {
            console.log('❌ Could not parse response:', data);
        }
    });
}).on('error', (err) => {
    console.error('❌ Network error:', err.message);
});

setTimeout(() => {
    console.log('\n⏱️  Test timeout (20 seconds)');
    process.exit(0);
}, 20000);
