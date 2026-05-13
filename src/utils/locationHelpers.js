// Helper function to check if location services are enabled
export const checkLocationPermission = async () => {
    const isNative = window.Capacitor?.isNativePlatform?.() ?? false;

    if (isNative) {
        try {
            // Dynamic import for Capacitor Geolocation
            const { Geolocation } = await import('@capacitor/geolocation');

            // Check permission status
            const permission = await Geolocation.checkPermissions();

            return {
                isEnabled: permission.location === 'granted' || permission.location === 'prompt',
                status: permission.location,
                isNative: true
            };
        } catch (error) {
            console.error('Error checking location permission:', error);
            return {
                isEnabled: false,
                status: 'error',
                error: error.message,
                isNative: true
            };
        }
    } else {
        // Browser environment - check if geolocation is available
        if (!navigator.geolocation) {
            return {
                isEnabled: false,
                status: 'unsupported',
                isNative: false
            };
        }

        // For browsers, we can't check if location is enabled without requesting it
        // So we return true and let the actual request handle errors
        return {
            isEnabled: true,
            status: 'available',
            isNative: false
        };
    }
};

// Request location permission (for native apps)
export const requestLocationPermission = async () => {
    const isNative = window.Capacitor?.isNativePlatform?.() ?? false;

    if (isNative) {
        try {
            const { Geolocation } = await import('@capacitor/geolocation');
            const permission = await Geolocation.requestPermissions();

            return {
                granted: permission.location === 'granted',
                status: permission.location
            };
        } catch (error) {
            console.error('Error requesting location permission:', error);
            return {
                granted: false,
                status: 'error',
                error: error.message
            };
        }
    }

    return {
        granted: true,
        status: 'browser'
    };
};

/**
 * Robust helper to get current GPS location
 * Handles permissions and platform differences
 */
export const getCurrentLocation = async () => {
    const isNative = window.Capacitor?.isNativePlatform?.() ?? false;
    
    try {
        if (isNative) {
            const { Geolocation } = await import('@capacitor/geolocation');
            
            // 1. Check permissions
            let check = await Geolocation.checkPermissions();
            
            if (check.location !== 'granted') {
                // 2. Request if not granted
                check = await Geolocation.requestPermissions();
                if (check.location !== 'granted') {
                    throw new Error('PERMISSION_DENIED');
                }
            }
            
            // 3. Try getting position with high accuracy first
            try {
                const position = await Geolocation.getCurrentPosition({
                    enableHighAccuracy: true,
                    timeout: 10000, // 10 seconds for first attempt
                    maximumAge: 0
                });
                
                const { latitude, longitude } = position.coords;
                return {
                    latitude,
                    longitude,
                    mapsLink: `https://www.google.com/maps/place/${latitude}+${longitude}/@${latitude},${longitude},17z`,
                    success: true
                };
            } catch (highAccuracyError) {
                console.warn('📍 High accuracy location failed, trying low accuracy...', highAccuracyError);
                
                // Fallback to low accuracy which is faster and works better indoors
                const position = await Geolocation.getCurrentPosition({
                    enableHighAccuracy: false,
                    timeout: 15000, 
                    maximumAge: 30000 // Allow 30 seconds old location for fallback
                });
                
                const { latitude, longitude } = position.coords;
                return {
                    latitude,
                    longitude,
                    mapsLink: `https://www.google.com/maps/place/${latitude}+${longitude}/@${latitude},${longitude},17z`,
                    success: true
                };
            }
        } else {
            // Browser Fallback
            if (!navigator.geolocation) {
                throw new Error('UNSUPPORTED');
            }
            
            const position = await new Promise((resolve, reject) => {
                // Try high accuracy first
                navigator.geolocation.getCurrentPosition(resolve, (err) => {
                    console.warn('📍 Browser high accuracy failed, trying low accuracy...', err);
                    // Fallback to low accuracy
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: false,
                        timeout: 15000,
                        maximumAge: 30000
                    });
                }, {
                    enableHighAccuracy: true,
                    timeout: 8000,
                    maximumAge: 0
                });
            });
            
            const { latitude, longitude } = position.coords;
            return {
                latitude,
                longitude,
                mapsLink: `https://www.google.com/maps/place/${latitude}+${longitude}/@${latitude},${longitude},17z`,
                success: true
            };
        }
    } catch (error) {
        console.error('📍 Location Error:', error);
        
        // --- FINAL FALLBACK: IP-based Geolocation ---
        // Attempting multiple providers for better reliability
        const ipProviders = [
            'https://ipapi.co/json/',
            'https://ip-api.com/json'
        ];

        for (const url of ipProviders) {
            try {
                console.log(`📡 Attempting IP-based fallback: ${url}`);
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                
                const response = await fetch(url, { signal: controller.signal });
                clearTimeout(timeoutId);
                
                const data = await response.json();
                
                // Both providers use lat/latitude and lon/longitude
                const lat = data.latitude || data.lat;
                const lon = data.longitude || data.lon;

                if (lat && lon) {
                    console.log('✅ IP-based geolocation successful');
                    return {
                        latitude: lat,
                        longitude: lon,
                        mapsLink: `https://www.google.com/maps/place/${lat}+${lon}/@${lat},${lon},17z`,
                        success: true,
                        isIPFallback: true
                    };
                }
            } catch (ipError) {
                console.warn(`❌ IP Fallback failed for ${url}:`, ipError.message);
            }
        }

        let message = 'Unable to get location';
        let code = 'UNKNOWN';
        const rawError = error.message || 'No specific error message';
        
        // Check for OS-level blocking
        const isOSBlocked = rawError.toLowerCase().includes('denied by the system') || 
                           rawError.toLowerCase().includes('origin does not have permission');

        if (error.message === 'PERMISSION_DENIED' || error.code === 1) {
            message = isOSBlocked 
                ? 'Location is blocked by phone settings. Please enable location for this app.' 
                : 'Please allow location permission in your browser settings.';
            code = 'PERMISSION_DENIED';
        } else if (error.code === 2 || rawError.toLowerCase().includes('not detected') || rawError.toLowerCase().includes('unavailable')) {
            message = 'Location not detected. Please ensure your GPS/Wi-Fi is on and try again.';
            code = 'POSITION_UNAVAILABLE';
        } else if (error.code === 3 || rawError.toLowerCase().includes('timeout')) {
            message = 'Location request timed out. Please try again in an open area.';
            code = 'TIMEOUT';
        } else if (error.message === 'UNSUPPORTED') {
            message = 'Geolocation is not supported by your browser';
            code = 'UNSUPPORTED';
        }
        
        // Append diagnostic info if it's still "Unable to get location"
        const finalMessage = message === 'Unable to get location' 
            ? `Unable to get location (System Error: ${rawError})` 
            : message;

        return { success: false, message: finalMessage, code, error: rawError };
    }
};
