// Script to set admin role for specific user
// Run this to make mohamedinamulhasan0@gmail.com an admin

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const setAdminRole = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Find user by email
        const adminEmail = 'mohamedinamulhasan0@gmail.com';
        const user = await User.findOne({ email: adminEmail });

        if (!user) {
            console.log(`❌ User with email ${adminEmail} not found`);
            process.exit(1);
        }

        console.log(`📧 Found user: ${user.name} (${user.email})`);
        console.log(`📋 Current role: ${user.role}`);

        if (user.role === 'admin') {
            console.log('✅ User is already an admin!');
        } else {
            user.role = 'admin';
            await user.save();
            console.log('✅ User role updated to admin!');
        }

        console.log('\n🎉 Admin setup complete!');
        console.log('💡 You can now see all user orders in the admin panel');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
};

setAdminRole();
