const mongoose = require('mongoose');
const path = require('path');
require('@babel/register')({
    presets: [['@babel/preset-env', { targets: { node: 'current' } }]]
});

// Mocking models if needed, but easier to just use mongoose
const productSchema = new mongoose.Schema({
    title: String,
    category: String,
    subcategory: [String],
    unit: String
});
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const URI = 'mongodb://mohamedinamulhasan0_db_user:hasan2004@ac-jybi7yq-shard-00-00.1egqvux.mongodb.net:27017,ac-jybi7yq-shard-00-01.1egqvux.mongodb.net:27017,ac-jybi7yq-shard-00-02.1egqvux.mongodb.net:27017/test?ssl=true&authSource=admin';

async function debug() {
    try {
        await mongoose.connect(URI);
        const snacks = await Product.find({
            $or: [
                { category: 'Snacks' },
                { category: 'சிற்றுண்டிகள்' }
            ]
        });

        console.log('--- SNACKS PRODUCTS ---');
        const summary = snacks.map(p => ({
            title: p.title,
            subcategory: p.subcategory,
            cat: p.category
        }));
        console.log(JSON.stringify(summary, null, 2));

        const subCounts = {};
        snacks.forEach(p => {
            const subs = p.subcategory || [];
            subs.forEach(s => {
                subCounts[s] = (subCounts[s] || 0) + 1;
            });
        });
        console.log('\n--- SUBCATEGORY FREQUENCY ---');
        console.log(subCounts);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
