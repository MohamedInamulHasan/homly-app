
import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000/api/stores';

async function checkStores() {
    try {
        console.log(`Fetching stores from ${API_URL}...`);
        const response = await axios.get(API_URL);
        const stores = response.data.data || [];

        console.log(`Total Stores: ${stores.length}`);
        stores.forEach(s => {
            console.log(`Store: "${s.name}" (ID: ${s._id})`);
            console.log(`  Type: ${JSON.stringify(s.type)}`);
        });

    } catch (error) {
        console.error('Error fetching stores:', error.message);
        if (error.response) {
            console.error('Data:', error.response.data);
        }
    }
}

checkStores();
