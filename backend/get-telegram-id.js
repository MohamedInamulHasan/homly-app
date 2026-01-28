import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

dotenv.config();

const findChatId = async () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
        console.error('❌ Error: TELEGRAM_BOT_TOKEN is missing in .env');
        return;
    }

    console.log(`🤖 Checking for messages on Bot: ${token.substring(0, 10)}...`);
    console.log('NOTE: You must send /start to your bot on Telegram for this to work.');

    try {
        const response = await axios.get(`https://api.telegram.org/bot${token}/getUpdates`);
        const updates = response.data.result;

        if (updates.length > 0) {
            // Find the most recent message
            const lastUpdate = updates[updates.length - 1];
            const chatId = lastUpdate.message?.chat?.id;
            const firstName = lastUpdate.message?.chat?.first_name;

            if (chatId) {
                console.log(`\n✅ FOUND CHAT ID: ${chatId} (User: ${firstName})`);

                // Attempt to update .env automatically
                const envPath = path.resolve(process.cwd(), '.env');
                let envContent = fs.readFileSync(envPath, 'utf8');

                if (envContent.includes('TELEGRAM_CHAT_ID=REPLACE_WITH_YOUR_ID')) {
                    envContent = envContent.replace(
                        'TELEGRAM_CHAT_ID=REPLACE_WITH_YOUR_ID',
                        `TELEGRAM_CHAT_ID=${chatId}`
                    );
                    fs.writeFileSync(envPath, envContent);
                    console.log('✅ Updated .env file automatically!');

                    // Send a confirmation message
                    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
                        chat_id: chatId,
                        text: "✅ <b>Homly Setup Complete!</b>\nYou will now receive order alerts here.",
                        parse_mode: "HTML"
                    });
                    console.log('📨 Sent confirmation message to your Telegram.');
                } else {
                    console.log('Example .env entry:\nTELEGRAM_CHAT_ID=' + chatId);
                }
            } else {
                console.log('⚠️ Found updates but no chat ID (maybe a status update?)');
                console.log(JSON.stringify(lastUpdate, null, 2));
            }
        } else {
            console.log('\n❌ No messages found yet.');
            console.log('👉 ACTION REQUIRED: Open your bot in Telegram and click START (or send /start).');
            console.log('Then run this script again.');
        }

    } catch (error) {
        console.error('❌ Error fetching updates:', error.message);
    }
};

findChatId();
