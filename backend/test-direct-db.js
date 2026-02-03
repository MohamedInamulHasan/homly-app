
import mongoose from 'mongoose';

// Direct connection string bypassing SRV lookup
const uri = 'mongodb://mohamedinamulhasan0_db_user:hasan2004@ac-jybi7yq-shard-00-00.1egqvux.mongodb.net:27017,ac-jybi7yq-shard-00-01.1egqvux.mongodb.net:27017,ac-jybi7yq-shard-00-02.1egqvux.mongodb.net:27017/test?ssl=true&authSource=admin';

// Note: I listed all 3 shards found in nslookup

const testConnection = async () => {
    console.log('--- Direct DB Connection Test ---');
    console.log('URI:', uri.replace(/:[^:@]+@/, ':****@')); 
    
    try {
        console.log('⏳ Connecting...');
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('✅ Success! Connected via Direct Shard URI.');
        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed:', error.message);
        process.exit(1);
    }
};

testConnection();
