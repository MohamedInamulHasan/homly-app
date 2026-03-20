import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const checkCollections = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();

        console.log('\n--- Collection Counts ---');
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`${col.name.padEnd(20)}: ${count}`);
        }
        console.log('-------------------------\n');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking collections:', error.message);
        process.exit(1);
    }
};

checkCollections();
