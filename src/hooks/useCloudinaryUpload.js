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
            // Prepare FormData (Standard File Upload)
            const formData = new FormData();
            formData.append('image', file); // Field name must match upload.single('image')

            // Upload to backend (backend handles Cloudinary auth)
            // Upload to backend (backend handles Cloudinary auth)
            // Explicitly Remove Content-Type so browser sets it with boundary
            const response = await api.post('/upload/image', formData, {
                headers: {
                    'Content-Type': undefined
                }
            });

            setUploading(false);
            return response.url;

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
