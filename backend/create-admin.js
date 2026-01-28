import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const createAdminUser = async () => {
    try {
        console.log('🔐 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
        });
        console.log('✅ Connected to MongoDB');

        // Check if admin user already exists
        const existingAdmin = await User.findOne({ email: 'mohamedinamulhasan0@gmail.com' });

        if (existingAdmin) {
            console.log('👤 Admin user already exists');
            console.log(`   Email: ${existingAdmin.email}`);
            console.log(`   Role: ${existingAdmin.role}`);

            // Update to admin if not already
            if (existingAdmin.role !== 'admin') {
                existingAdmin.role = 'admin';
                await existingAdmin.save();
                console.log('✅ Updated user role to admin');
            } else {
                console.log('✅ User is already an admin');
            }
        } else {
            // Create new admin user
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('Moh@2004', salt);

            const adminUser = await User.create({
                name: 'Mohamed Inamul Hasan',
                email: 'mohamedinamulhasan0@gmail.com',
                password: hashedPassword,
                role: 'admin',
                mobile: '1234567890',
                address: 'Admin Address'
            });

            console.log('✅ Created new admin user:');
            console.log(`   Name: ${adminUser.name}`);
            console.log(`   Email: ${adminUser.email}`);
            console.log(`   Role: ${adminUser.role}`);
        }

        await mongoose.connection.close();
        console.log('\n✅ Admin user setup complete!');
        console.log('\n📝 Login credentials:');
        console.log('   Email: mohamedinamulhasan0@gmail.com');
        console.log('   Password: Moh@2004');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    }
};

createAdminUser();
