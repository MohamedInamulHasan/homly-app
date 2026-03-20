import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const checkUser = async () => {
    try {
        console.log('Connecting to DB...');
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error('MONGODB_URI is undefined in .env');
        }
        await mongoose.connect(uri);
        console.log('MongoDB Connected');

        const email = 'mohamedinamulhasan0@gmail.com';
        const user = await User.findOne({ email });

        if (user) {
            console.log('User Found:', JSON.stringify(user, null, 2));
        } else {
            console.log('User NOT Found');
        }
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        // Close connection safely
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
        process.exit();
    }
};

checkUser();
