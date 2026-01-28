import { useState } from 'react';
import api from '../utils/api';

/**
 * Hook for Direct Cloudinary Uploads using Signed Request
 * @returns {Object} { uploadImage, uploading, error }
 */
const useCloudinaryUpload = () => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const uploadImage = async (file) => {
        setUploading(true);
        setError(null);

        try {
            // 1. Get Signature from Backend (Cookie-based Auth handled by api instance)
            const signatureData = await api.get('/upload/signature');

            const { signature, timestamp, cloudName, apiKey, folder } = signatureData;

            // 2. Prepare Form Data for Cloudinary
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', apiKey);
            formData.append('timestamp', timestamp);
            formData.append('signature', signature);
            formData.append('folder', folder);

            // 3. Upload Directly to Cloudinary
            const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

            const response = await fetch(cloudinaryUrl, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'Cloudinary Upload Failed');
            }

            setUploading(false);
            return data.secure_url; // Return the hosted URL

        } catch (err) {
            console.error('Upload Error:', err);
            setError(err.message || 'Image upload failed');
            setUploading(false);
            throw err;
        }
    };

    return { uploadImage, uploading, error };
};

export default useCloudinaryUpload;
