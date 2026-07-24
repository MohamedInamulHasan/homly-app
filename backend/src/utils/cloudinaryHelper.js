import { v2 as cloudinary } from 'cloudinary';

/**
 * Delete image from Cloudinary using its secure URL
 * @param {string|string[]} imageUrls - Single Cloudinary URL or array of URLs
 */
export const deleteFromCloudinary = async (imageUrls) => {
    if (!imageUrls) return;

    const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    for (const imageUrl of urls) {
        if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.includes('cloudinary.com')) {
            continue;
        }
        try {
            // Example: https://res.cloudinary.com/dwvhb06hh/image/upload/v1721839200/homly_products/abc123.jpg
            const splitUrl = imageUrl.split('/upload/');
            if (splitUrl.length > 1) {
                let pathAfterUpload = splitUrl[1]; // e.g. "v1721839200/homly_products/abc123.jpg"
                // Remove version tag (e.g., v1721839200/) if present
                pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, '');
                // Remove file extension (.jpg, .png, .jpeg, .webp, etc.)
                const lastDotIndex = pathAfterUpload.lastIndexOf('.');
                const publicId = lastDotIndex !== -1 ? pathAfterUpload.substring(0, lastDotIndex) : pathAfterUpload;

                if (publicId) {
                    console.log(`🗑️ Deleting image from Cloudinary (public_id: ${publicId})...`);
                    const result = await cloudinary.uploader.destroy(publicId);
                    console.log(`✅ Cloudinary destroy response for ${publicId}:`, result);
                }
            }
        } catch (err) {
            console.error(`⚠️ Failed to delete image (${imageUrl}) from Cloudinary:`, err.message);
        }
    }
};
