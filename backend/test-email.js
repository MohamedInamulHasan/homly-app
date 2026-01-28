import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('Testing Email Configuration...');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not Set');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not Set');
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL ? 'Set' : 'Not Set');

const testEmail = async () => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            throw new Error('EMAIL_USER or EMAIL_PASS not found in .env');
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Verify connection configuration
        await transporter.verify();
        console.log('✅ SMTP Connection verified successfully');

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
            subject: 'Test Email from ShopEase Debugger',
            text: 'If you are reading this, your email configuration is working correctly!'
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', info.messageId);

    } catch (error) {
        console.error('❌ Email Test Failed:');
        console.error(error);
    }
};

testEmail();
