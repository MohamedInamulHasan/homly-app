import axios from 'axios';

const API_URL = 'http://127.0.0.1:5000/api/products?limit=1000';

async function checkProducts() {
    try {
        console.log(`Fetching products from ${API_URL}...`);
        const response = await axios.get(API_URL);
        const products = response.data.data || [];

        console.log(`Total Products Fetched: ${products.length}`);

        const categories = {};
        const hiddenProducts = [];

        products.forEach(p => {
            const cat = p.category || 'Uncategorized';
            if (!categories[cat]) {
                categories[cat] = { count: 0, available: 0, unavailable: 0, examples: [] };
            }
            categories[cat].count++;
            if (p.isAvailable !== false) {
                categories[cat].available++;
            } else {
                categories[cat].unavailable++;
                hiddenProducts.push(`${p.title} (${cat})`);
            }

            if (categories[cat].examples.length < 3) {
                categories[cat].examples.push(p.title);
            }
        });

        console.log('\n--- Category Breakdown ---');
        Object.entries(categories).forEach(([cat, stats]) => {
            console.log(`[${cat}]: Total ${stats.count} (✅ ${stats.available} | ❌ ${stats.unavailable})`);
            console.log(`   Examples: ${stats.examples.join(', ')}`);
        });

        console.log('\n--- Unavailable (Hidden) Products ---');
        if (hiddenProducts.length > 0) {
            hiddenProducts.forEach(p => console.log(`- ${p}`));
        } else {
            console.log('None.');
        }

    } catch (error) {
        console.error('Error fetching products:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

checkProducts();
