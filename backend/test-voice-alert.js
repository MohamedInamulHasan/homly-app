import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const testNtfyAlert = async () => {
    const topic = process.env.NTFY_TOPIC;

    if (!topic) {
        console.error('❌ Error: NTFY_TOPIC not found in .env file!');
        return;
    }

    console.log('🧪 Testing ntfy.sh High-Priority Alert...');
    console.log(`📡 Sending to topic: ${topic}`);

    try {
        const response = await axios.post(`https://ntfy.sh/${topic}`, 
            '🚨 TEST ALERT: If you hear a loud ringtone, ntfy is working!', 
            {
                headers: {
                    'Title': 'Ily Mart Test',
                    'Priority': '5',
                    'Tags': 'fire,rotating_light'
                }
            }
        );

        console.log('✅ Success! ntfy response status:', response.status);
        console.log('📱 Check your phone for the alert!');
    } catch (error) {
        console.error('❌ Failed to trigger alert:', error.response?.data || error.message);
    }
};

testNtfyAlert();
