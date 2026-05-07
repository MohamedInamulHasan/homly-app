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
    if (url.toLowerCase().startsWith('intent:')) {
        // Try to extract coordinates from the intent URL for a cleaner geo: link
        const coordMatch = url.match(/place\/([0-9.]+)\+([0-9.]+)/);
        if (coordMatch) {
            const lat = coordMatch[1];
            const lng = coordMatch[2];
            finalUrl = `geo:${lat},${lng}?q=${lat},${lng}`;
        } else {
            // Fallback: convert to standard https and strip the intent garbage
            finalUrl = url.replace(/intent:?\/\//i, 'https://').split('#')[0];
        }
    }
    // If it's a standard google maps link, try to convert to geo: for Android
    else if (url.includes('google.com/maps') || url.includes('maps.google.com')) {
        const coordMatch = url.match(/query=([0-9.-]+),([0-9.-]+)/) || url.match(/place\/([0-9.]+)\+([0-9.]+)/);
        if (coordMatch) {
            const lat = coordMatch[1];
            const lng = coordMatch[2];
            // On Android native, geo: is the gold standard
            if (window.Capacitor && window.Capacitor.getPlatform() === 'android') {
                finalUrl = `geo:${lat},${lng}?q=${lat},${lng}`;
            } else {
                finalUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
            }
        }
    }
    // If it's not a URL at all, assume it's a map query
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
