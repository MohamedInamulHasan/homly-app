
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const checkCoins = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const users = await User.find({ coins: { $gt: 0 } });
        console.log('Users with coins:', users.length);
        users.forEach(u => {
            console.log(`User: ${u.email}, Coins: ${u.coins}`);
        });

        const allUsers = await User.find({});
        console.log('Total Users:', allUsers.length);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkCoins();
