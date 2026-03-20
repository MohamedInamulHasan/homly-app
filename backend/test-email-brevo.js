import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Testing Email Configuration from .env file...\n');

console.log('Configuration:');
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_PORT:', process.env.SMTP_PORT);
console.log('SMTP_USER:', process.env.SMTP_USER);
console.log('SMTP_PASS:', process.env.SMTP_PASS ? '✓ Set' : '✗ Missing');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);
console.log('\n---\n');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendTestEmail = async () => {
    try {
        console.log('📧 Sending test email...\n');

        const info = await transporter.sendMail({
            from: `"Homly Test" <${process.env.EMAIL_USER}>`,
            to: process.env.ADMIN_EMAIL,
            subject: `Test Email - ${new Date().toLocaleTimeString()}`,
            text: 'This is a test email from your Homly backend.',
            html: '<b>This is a test email from your Homly backend.</b><br><br>If you see this, email is working!'
        });

        console.log('✅ SUCCESS! Email sent!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
        console.log('\n✅ Check your inbox:', process.env.ADMIN_EMAIL);
        console.log('✅ Also check SPAM folder!');
    } catch (error) {
        console.error('❌ FAILED to send email!');
        console.error('Error:', error.message);
        console.error('Code:', error.code);
        console.error('Command:', error.command);

        if (error.code === 'EAUTH') {
            console.error('\n⚠️  Authentication failed! Check your SMTP_USER and SMTP_PASS');
        } else if (error.code === 'ECONNECTION') {
            console.error('\n⚠️  Connection failed! Check your SMTP_HOST and SMTP_PORT');
        }
    }
};

sendTestEmail();
