import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

// Load environment variables
dotenv.config();

const makeAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Find user by email and update role to admin
        const email = 'mohamedinamulhasan0@gmail.com';

        const user = await User.findOneAndUpdate(
            { email: email },
            { role: 'admin' },
            { new: true }
        );

        if (user) {
            console.log(`✅ Success! User ${email} is now an admin`);
            console.log('User details:', {
                name: user.name,
                email: user.email,
                role: user.role
            });
        } else {
            console.log(`❌ User with email ${email} not found`);
            console.log('Please make sure you have registered an account first');
        }

        // Disconnect
        await mongoose.disconnect();
        console.log('MongoDB Disconnected');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

makeAdmin();
