import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from backend directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, 'src', '.env') }); // Try src/.env first
if (!process.env.SMTP_USER) {
    dotenv.config({ path: path.join(__dirname, '.env') }); // Fallback to root .env
}

console.log('📧 Testing Email Service...');
console.log('Host:', process.env.SMTP_HOST);
console.log('User:', process.env.SMTP_USER);
console.log('Pass:', process.env.SMTP_PASS ? '******' : 'MISSING');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendTestEmail = async () => {
    try {
        const info = await transporter.sendMail({
            from: `"Homly Test" <${process.env.EMAIL_USER}>`,
            to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
            subject: 'Test Email from Homly Debugger',
            text: 'If you see this, email sending is working!',
            html: '<b>If you see this, email sending is working!</b>'
        });
        console.log('✅ Email sent successfully:', info.messageId);
    } catch (error) {
        console.error('❌ Email failed:', error);
    }
};

sendTestEmail();
