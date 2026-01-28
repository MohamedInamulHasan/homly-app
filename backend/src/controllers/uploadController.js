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

        const signature = cloudinary.utils.api_sign_request({
            timestamp: timestamp,
            folder: 'homly_products' // Optional: Organize in a folder
        }, process.env.CLOUDINARY_API_SECRET);

        res.json({
            timestamp,
            signature,
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            folder: 'homly_products'
        });
    } catch (error) {
        console.error('Cloudinary Signature Error:', error);
        res.status(500).json({ message: 'Could not generate upload signature' });
    }
};
