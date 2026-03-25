import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendOrderVoiceAlert } from './src/services/voiceService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const testLiveCode = async () => {
    console.log('🧪 Testing actual voiceService.js code with a mock order...');
    
    // Mock order object that matches what the controller passes
    const mockOrder = {
        _id: '64f1b2c3d4e5f6g7h8i9j0k1',
        total: 1250,
        items: []
    };

    try {
        const result = await sendOrderVoiceAlert(mockOrder);
        console.log('✅ Result of sendOrderVoiceAlert:', result);
    } catch (error) {
        console.error('❌ Error executing function:', error);
    }
};

testLiveCode();
