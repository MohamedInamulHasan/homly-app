import express from 'express';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import errorHandler from './middleware/errorHandler.js';
import connectDB from './config/database.js';
import axios from 'axios'; // For Keep-Warm mechanism

// Import routes
import productRoutes from './routes/products.js';
import userRoutes from './routes/users.js';
import orderRoutes from './routes/orders.js';
import storeRoutes from './routes/stores.js';
import newsRoutes from './routes/news.js';
import adRoutes from './routes/ads.js';
import categoryRoutes from './routes/categories.js';
import serviceRoutes from './routes/services.js';
import serviceRequestRoutes from './routes/serviceRequests.js';
import settingsRoutes from './routes/settingsRoutes.js';

// Load environment variables
dotenv.config();

// Connect to database
console.log('🚀 Initializing server...');
connectDB().then(() => console.log('✅ ConnectDB promise resolved')).catch(e => console.error('❌ ConnectDB promise rejected', e));


// Initialize Express app
const app = express();

// DEBUG: Request Logger
app.use((req, res, next) => {
    console.log(`📥 [${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Middleware (Force Restart)
app.use(cors({
    origin: true, // Allow any origin
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Enable compression for all responses (reduces payload size by 60-80%)
app.use(compression());
app.use(cookieParser());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.get('/', (req, res) => {
    res.send(`API is running... (Restarted: ${new Date().toISOString()})`);
});

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/settings', settingsRoutes);

// Upload Route (Cloudinary)
import { getUploadSignature } from './controllers/uploadController.js';
import { protect } from './middleware/authMiddleware.js';
app.get('/api/upload/signature', protect, getUploadSignature);

// Error handler middleware (must be last)
app.use(errorHandler);

// DEBUG: Temporary Email Test Route
import { sendOrderNotificationEmail } from './services/emailService.js';
app.get('/api/debug-email', async (req, res) => {
    try {
        console.log('🧪 Triggering Test Email...');
        // Mock order object
        const mockOrder = {
            _id: 'TEST_ORDER_' + Date.now(),
            shippingAddress: {
                name: 'Test Admin',
                email: process.env.ADMIN_EMAIL || 'mohamedinamulhasan0@gmail.com',
                mobile: '0000000000',
                street: 'Test St',
                city: 'Test City',
                zip: '00000'
            },
            items: [{ name: 'Test Product', quantity: 1, price: 100 }],
            total: 100,
            subtotal: 100,
            shipping: 0,
            createdAt: new Date()
        };

        const result = await sendOrderNotificationEmail(mockOrder);

        if (result.success) {
            res.json({
                success: true,
                message: '✅ Email Sent Successfully!',
                details: result,
                config: {
                    user: process.env.EMAIL_USER ? 'Set' : 'Missing',
                    pass: process.env.EMAIL_PASS ? 'Set' : 'Missing',
                    admin: process.env.ADMIN_EMAIL
                }
            });
        } else {
            res.status(500).json({
                success: false,
                message: '❌ Email Failed',
                error: result.error,
                config: {
                    host: process.env.SMTP_HOST || 'DEFAULT (Gmail)',
                    port: process.env.SMTP_PORT || 'DEFAULT (587)',
                    user: process.env.SMTP_USER || process.env.EMAIL_USER || 'MISSING'
                }
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '❌ Critical Error',
            error: error.message,
            stack: error.stack
        });
    }
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`Resource: http://0.0.0.0:${PORT}`);

    // KEEP-WARM MECHANISM (Prevent Free Tier Sleep)
    // Ping the server every 5 minutes (300,000 ms)
    const KEEP_ALIVE_INTERVAL = 5 * 60 * 1000; // 5 minutes

    const keepAlive = () => {
        if (process.env.NODE_ENV === 'production') {
            const url = `https://homly-backend-8616.onrender.com/`;
            axios.get(url)
                .then(() => console.log(`🔥 [Keep-Warm] Ping successful: ${new Date().toISOString()}`))
                .catch(error => console.error(`⚠️ [Keep-Warm] Ping failed: ${error.message}`));
        } else {
            console.log('ℹ️ [Keep-Warm] Skipping ping in development mode');
        }
    };

    // Run immediately on start, then periodically
    if (process.env.NODE_ENV === 'production') {
        setTimeout(keepAlive, 10000); // Wait 10s after start
        setInterval(keepAlive, KEEP_ALIVE_INTERVAL);
    }
});
