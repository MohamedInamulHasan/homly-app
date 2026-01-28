import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing MongoDB Connection...');
console.log('Connection String (masked):', process.env.MONGODB_URI?.replace(/:[^:@]+@/, ':****@'));

const testConnection = async () => {
    try {
        console.log('\n🔄 Attempting to connect...');

        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
        });

        console.log('✅ SUCCESS! MongoDB Connected:', conn.connection.host);
        console.log('✅ Database:', conn.connection.name);
        console.log('✅ Connection State:', conn.connection.readyState);

        // Try to fetch a simple count
        const collections = await conn.connection.db.listCollections().toArray();
        console.log('✅ Collections found:', collections.map(c => c.name).join(', '));

        await mongoose.connection.close();
        console.log('\n✅ Test completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Connection FAILED!');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);

        if (error.message.includes('authentication')) {
            console.error('\n💡 This looks like an authentication error.');
            console.error('   Check your MongoDB username and password in .env');
        } else if (error.message.includes('ETIMEDOUT') || error.message.includes('timed out')) {
            console.error('\n💡 Connection timed out.');
            console.error('   Even though network test passed, MongoDB might be rejecting the connection.');
            console.error('   Check:');
            console.error('   1. IP whitelist in MongoDB Atlas');
            console.error('   2. Database user exists and has correct permissions');
            console.error('   3. Connection string format is correct');
        }

        process.exit(1);
    }
};

testConnection();
