import axios from 'axios';

async function checkHealth() {
    try {
        console.log('Checking backend health...');
        const response = await axios.get('http://localhost:5000/');
        console.log('✅ Backend is responding:', response.data);
    } catch (error) {
        console.error('❌ Backend check failed:', error.message);
    }
}

checkHealth();
