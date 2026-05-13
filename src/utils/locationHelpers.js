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
        // If native methods fail (especially on Desktops without GPS), try IP geolocation
        try {
            console.log('📡 Attempting IP-based geolocation fallback...');
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            
            if (data.latitude && data.longitude) {
                console.log('✅ IP-based geolocation successful');
                const { latitude, longitude } = data;
                return {
                    latitude,
                    longitude,
                    mapsLink: `https://www.google.com/maps/place/${latitude}+${longitude}/@${latitude},${longitude},17z`,
                    success: true,
                    isIPFallback: true // Flag to indicate this is approximate
                };
            }
        } catch (ipError) {
            console.error('❌ IP Fallback failed:', ipError);
        }

        let message = 'Unable to get location';
        let code = 'UNKNOWN';
        
        // Check for specific browser error messages that indicate OS-level blocking
        const isOSBlocked = error.message?.toLowerCase().includes('denied by the system') || 
                           error.message?.toLowerCase().includes('origin does not have permission');

        // Handle standard Geolocation error codes
        if (error.message === 'PERMISSION_DENIED' || error.code === 1) {
            message = isOSBlocked 
                ? 'Location is blocked by Windows. Please enable "Location Services" in Windows Settings.' 
                : 'Please allow location permission in your browser settings.';
            code = 'PERMISSION_DENIED';
        } else if (error.code === 2 || error.message?.toLowerCase().includes('not detected') || error.message?.toLowerCase().includes('unavailable')) {
            message = 'Location not detected. Please ensure your GPS/Wi-Fi is on and try again.';
            code = 'POSITION_UNAVAILABLE';
        } else if (error.code === 3 || error.message?.toLowerCase().includes('timeout')) {
            message = 'Location request timed out. Please try again in an open area or turn on Wi-Fi.';
            code = 'TIMEOUT';
        } else if (error.message === 'UNSUPPORTED') {
            message = 'Geolocation is not supported by your browser';
            code = 'UNSUPPORTED';
        }
        
        return { success: false, message, code, error: error.message };
    }
};
