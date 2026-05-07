import { Browser } from '@capacitor/browser';

/**
 * Opens a URL in the system's external browser.
 * Works for both web and native platforms via Capacitor Browser plugin.
 * @param {string} url - The URL to open.
 */
export const openExternalLink = async (url) => {
    if (!url) return;
    
    let finalUrl = url;
    
    // Handle Android Intent URLs (often cause ERR_UNKNOWN_URL_SCHEME in WebViews)
    if (url.startsWith('intent://')) {
        // Extract the web URL from the intent if possible, or just convert to https
        finalUrl = url.replace('intent://', 'https://').split('#')[0];
    }
    // If it's not a URL, assume it's a map query
    else if (!url.startsWith('http') && !url.startsWith('geo:')) {
        finalUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(url)}`;
    }
    
    try {
        // If running in a Capacitor environment (native app)
        if (window.Capacitor && window.Capacitor.isNativePlatform()) {
            const platform = window.Capacitor.getPlatform();
            
            if (platform === 'android') {
                // On Android, window.open with _system is more reliable for triggering 
                // the native app chooser (e.g., opening Google Maps app).
                window.open(finalUrl, '_system');
            } else {
                // iOS and other native platforms
                await Browser.open({ url: finalUrl });
            }
        } else {
            // Fallback for web browser
            const newWindow = window.open(finalUrl, '_blank', 'noopener,noreferrer');
            if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                // Pop-up blocked, try standard location update
                window.location.href = finalUrl;
            }
        }
    } catch (error) {
        console.error('Error opening external link:', error);
        // Final fallback attempt
        try {
            window.open(finalUrl, '_system');
        } catch (e) {
            window.location.href = finalUrl;
        }
    }
};
