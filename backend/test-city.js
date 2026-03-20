import axios from 'axios';

async function test() {
    try {
        console.log('Attempting to update cities...');
        const response = await axios.put('http://localhost:5000/api/settings/cities', {
            value: ['TestCity1', 'TestCity2'],
            description: 'Cities list debug'
        });
        console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    }
}

test();
