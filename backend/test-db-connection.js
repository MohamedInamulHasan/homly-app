import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
    console.log('--- MongoDB Diagnostic Test ---');
    console.log(`URI: ${process.env.MONGODB_URI.split('@')[1]}`); // Log only cluster info
    console.log('Time:', new Date().toISOString());
    console.log('-------------------------------');

    try {
        console.log('⏳ Attempting to connect to MongoDB...');
        const start = Date.now();

        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000, // Fail fast for diagnostics
        });

        const end = Date.now();
        console.log(`✅ Success! Connected in ${end - start}ms`);

        const count = await mongoose.connection.db.admin().listDatabases();
        console.log('📂 Database access confirmed.');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ CONNECTION FAILED!');
        console.error('Error Name:', error.name);
        console.error('Error Message:', error.message);

        if (error.name === 'MongoNetworkTimeoutError' || error.message.includes('timeout')) {
            console.log('\n⚠️ DIAGNOSIS: Network Timeout');
            console.log('Your computer cannot reach the MongoDB server.');
            console.log('Possible causes:');
            console.log('1. IP Address not whitelisted in MongoDB Atlas.');
            console.log('2. A firewall (like McAfee, which I saw in your bookmarks) is blocking the connection.');
            console.log('3. Your ISP (internet provider) is blocking port 27017.');
        } else if (error.message.includes('Authentication failed')) {
            console.log('\n⚠️ DIAGNOSIS: Bad Credentials');
            console.log('The password or username in your MONGODB_URI is incorrect.');
        }

        process.exit(1);
    }
};

testConnection();
