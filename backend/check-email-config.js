import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from current directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const testEmail = async () => {
    console.log('🔍 Diagnostic: Checking Email Configuration...');

    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;
    const admin = process.env.ADMIN_EMAIL;

    console.log(`👤 EMAIL_USER: ${user ? user : 'INVALID/MISSING'}`);
    console.log(`🔑 EMAIL_PASS: ${pass ? 'Set (Length: ' + pass.length + ')' : 'MISSING'}`);
    console.log(`👑 ADMIN_EMAIL: ${admin}`);

    if (!user || !pass) {
        console.error('❌ ERROR: Missing credentials in .env');
        return;
    }

    console.log('📧 Creating transporter...');
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: user,
            pass: pass
        },
        debug: true, // Internal nodemailer logging
        logger: true // Internal nodemailer logging
    });

    try {
        console.log('🔄 Verifying connection...');
        await transporter.verify();
        console.log('✅ Connection verified! Credentials are correct.');

        console.log('📤 Attempting to send test email to self...');
        const info = await transporter.sendMail({
            from: user,
            to: user, // Send to self
            subject: '🔍 Test Email from Diagnostic Script',
            text: 'If you see this, the email configuration is working correctly.',
            html: '<h3>✅ Email Working!</h3><p>If you see this, the email configuration is working correctly.</p>'
        });

        console.log('✅ Email sent successfully!');
        console.log('🆔 Message ID:', info.messageId);
        console.log('📨 Preview URL:', nodemailer.getTestMessageUrl(info));

    } catch (error) {
        console.error('❌ FAILURE: Could not send email.');
        console.error('⚠️ Error Name:', error.name);
        console.error('⚠️ Error Message:', error.message);
        if (error.response) {
            console.error('⚠️ SMTP Response:', error.response);
        }
    }
};

testEmail();
