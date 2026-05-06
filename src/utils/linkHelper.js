import { Browser } from '@capacitor/browser';

/**
 * Opens a URL in the system's external browser.
 * Works for both web and native platforms via Capacitor Browser plugin.
 * @param {string} url - The URL to open.
 */
export const openExternalLink = async (url) => {
    if (!url) return;
    
    let finalUrl = url;
    // If it's not a URL, assume it's a map query
    if (!url.startsWith('http') && !url.startsWith('geo:')) {
        finalUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(url)}`;
    }
    
    try {
        // If running in a Capacitor environment (native app)
        if (window.Capacitor && window.Capacitor.isNativePlatform()) {
            await Browser.open({ url: finalUrl });
        } else {
            // Fallback for web browser
            window.open(finalUrl, '_blank', 'noopener,noreferrer');
        }
    } catch (error) {
        console.error('Error opening external link:', error);
        // Last resort fallback
        window.open(finalUrl, '_blank', 'noopener,noreferrer');
    }
};
