import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// @desc    Get Cloudinary Signature for client-side upload
// @route   GET /api/upload/signature
// @access  Private (Admin only recommended, or authenticated users)
export const getUploadSignature = (req, res) => {
    try {
        const timestamp = Math.round((new Date()).getTime() / 1000);
        const folder = 'homly_products';

        // Parameters to sign (must match what's sent to Cloudinary)
        const paramsToSign = {
            timestamp: timestamp,
            folder: folder
        };

        // Generate signature using Cloudinary's utility
        const signature = cloudinary.utils.api_sign_request(
            paramsToSign,
            process.env.CLOUDINARY_API_SECRET
        );

        const responseData = {
            timestamp,
            signature,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            folder: folder
        };

        console.log('📤 Sending upload signature:', {
            ...responseData,
            apiSecret: '***hidden***'
        });

        res.json(responseData);
    } catch (error) {
        console.error('❌ Cloudinary Signature Error:', error);
        res.status(500).json({ message: 'Could not generate upload signature' });
    }
};

// @desc    Upload image to Cloudinary (server-side via Multer)
// @route   POST /api/upload/image
// @access  Private
export const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        console.log('📤 Uploading image buffer to Cloudinary...');

        // Debug Log Credentials (Safe)
        console.log('🔧 Cloudinary Config Check:', {
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'MISSING',
            api_secret: process.env.CLOUDINARY_API_SECRET ? '***' + process.env.CLOUDINARY_API_SECRET.slice(-4) : 'MISSING'
        });

        // Explicitly set config to ensure it's loaded
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET
        });

        // Convert buffer to base64 for Cloudinary upload
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'homly_products',
            resource_type: 'auto'
        });

        console.log('✅ Image uploaded successfully:', result.secure_url);

        res.json({
            success: true,
            url: result.secure_url
        });
    } catch (error) {
        console.error('❌ Cloudinary Upload Error:', error);
        res.status(500).json({ message: 'Image upload failed', error: error.message });
    }
};
