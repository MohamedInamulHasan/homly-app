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
            
            // 3. Get position with high accuracy and longer timeout
            const position = await Geolocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 20000, // 20 seconds
                maximumAge: 0
            });
            
            const { latitude, longitude } = position.coords;
            return {
                latitude,
                longitude,
                mapsLink: `https://www.google.com/maps/place/${latitude}+${longitude}/@${latitude},${longitude},17z`,
                success: true
            };
        } else {
            // Browser Fallback
            if (!navigator.geolocation) {
                throw new Error('UNSUPPORTED');
            }
            
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 15000,
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
        let message = 'Unable to get location';
        let code = 'UNKNOWN';
        
        if (error.message === 'PERMISSION_DENIED' || error.code === 1) {
            message = 'Please allow location permission in settings';
            code = 'PERMISSION_DENIED';
        } else if (error.code === 3 || error.message?.includes('timeout')) {
            message = 'Location request timed out. Please try again in an open area.';
            code = 'TIMEOUT';
        } else if (error.message === 'UNSUPPORTED') {
            message = 'Geolocation is not supported by your browser';
            code = 'UNSUPPORTED';
        }
        
        return { success: false, message, code, error };
    }
};
