import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000/api/categories';

async function checkCategories() {
    try {
        console.log(`Fetching categories from ${API_URL}...`);
        const response = await axios.get(API_URL);
        const categories = response.data.data || [];

        console.log(`Total Official Categories: ${categories.length}`);

        console.log('\n--- Official Categories ---');
        categories.forEach(c => {
            console.log(`- "${c.name}" (ID: ${c._id})`);
        });

    } catch (error) {
        console.error('Error fetching categories:', error.message);
    }
}

checkCategories();
