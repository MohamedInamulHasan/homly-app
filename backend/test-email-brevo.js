import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('🔍 Testing Email Configuration...\n');
console.log('Environment Variables:');
console.log('- SMTP_HOST:', process.env.SMTP_HOST || 'Not Set');
console.log('- SMTP_PORT:', process.env.SMTP_PORT || 'Not Set');
console.log('- SMTP_USER:', process.env.SMTP_USER ? 'Set ✅' : 'Not Set ❌');
console.log('- SMTP_PASS:', process.env.SMTP_PASS ? 'Set ✅' : 'Not Set ❌');
console.log('- EMAIL_USER:', process.env.EMAIL_USER ? 'Set ✅' : 'Not Set ❌');
console.log('- ADMIN_EMAIL:', process.env.ADMIN_EMAIL ? 'Set ✅' : 'Not Set ❌');
console.log('');

const testEmail = async () => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            throw new Error('SMTP_USER or SMTP_PASS not found in .env');
        }

        console.log('📧 Creating Brevo SMTP transporter...');
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        // Verify connection configuration
        console.log('🔌 Verifying SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP Connection verified successfully!\n');

        const mailOptions = {
            from: `"Homly Test" <${process.env.EMAIL_USER}>`,
            to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
            subject: 'Test Email from Homly Backend',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2563eb;">✅ Email Configuration Test</h2>
                    <p>If you are reading this, your email configuration is working correctly!</p>
                    <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>SMTP Host:</strong> ${process.env.SMTP_HOST}</p>
                    <p><strong>From:</strong> ${process.env.EMAIL_USER}</p>
                    <p><strong>To:</strong> ${process.env.ADMIN_EMAIL}</p>
                </div>
            `
        };

        console.log('📨 Sending test email...');
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Test email sent successfully!');
        console.log('📬 Message ID:', info.messageId);
        console.log('📧 Email sent to:', process.env.ADMIN_EMAIL);
        console.log('\n✨ Check your inbox at', process.env.ADMIN_EMAIL);

    } catch (error) {
        console.error('\n❌ Email Test Failed:');
        console.error('Error:', error.message);
        if (error.code) {
            console.error('Error Code:', error.code);
        }
        if (error.response) {
            console.error('SMTP Response:', error.response);
        }
    }
};

testEmail();
