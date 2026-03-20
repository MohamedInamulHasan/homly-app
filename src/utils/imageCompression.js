/**
 * Compress and resize image to prevent backend crashes
 * @param {File} file - The image file to compress
 * @param {number} maxSizeKB - Maximum size in KB (default 500KB)
 * @param {number} maxWidth - Maximum width in pixels (default 800px)
 * @returns {Promise<string>} - Base64 encoded compressed image
 */
export const compressImage = (file, maxSizeKB = 500, maxWidth = 800) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Resize if image is too large
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Start with high quality
                let quality = 0.9;
                let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

                // Reduce quality until size is acceptable
                while (compressedDataUrl.length > maxSizeKB * 1024 * 1.37 && quality > 0.1) {
                    quality -= 0.1;
                    compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                }

                resolve(compressedDataUrl);
            };

            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target.result;
        };

        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
};

/**
 * Validate image file size
 * @param {File} file - The image file to validate
 * @param {number} maxSizeMB - Maximum size in MB
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateImageSize = (file, maxSizeMB = 5) => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
};
