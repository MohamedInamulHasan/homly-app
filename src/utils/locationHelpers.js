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
            
            // 1. Check permissions (with resilience for manifest sync issues)
            let check;
            try {
                check = await Geolocation.checkPermissions();
            } catch (pError) {
                console.warn('📍 Permission check failed (likely manifest sync), proceeding anyway...', pError);
                check = { location: 'prompt' }; // Fallback to prompt
            }
            
            if (check.location !== 'granted') {
                // 2. Request if not granted
                try {
                    check = await Geolocation.requestPermissions();
                } catch (rError) {
                    console.warn('📍 Permission request failed, attempting direct access...', rError);
                    // If request fails, we still try to get position (OS might prompt)
                }
            }
            
            // 3. Try getting position with high accuracy first
            try {
                console.log('📍 Native: Attempting high accuracy getCurrentPosition...');
                const position = await Geolocation.getCurrentPosition({
                    enableHighAccuracy: true,
                    timeout: 8000, // 8 seconds timeout
                    maximumAge: 0
                });
                
                const { latitude, longitude } = position.coords;
                console.log('✅ Native: High accuracy location obtained:', latitude, longitude);
                return {
                    latitude,
                    longitude,
                    mapsLink: `https://www.google.com/maps/place/${latitude}+${longitude}/@${latitude},${longitude},17z`,
                    success: true
                };
            } catch (highAccuracyError) {
                console.warn('📍 Native: High accuracy failed, trying last known position...', highAccuracyError);
                
                // Fallback A: Get last known cached position (instant and highly reliable on mobile)
                try {
                    const lastKnown = await Geolocation.getLastKnownPosition();
                    if (lastKnown && lastKnown.coords) {
                        const { latitude, longitude } = lastKnown.coords;
                        console.log('✅ Native: Last known location obtained:', latitude, longitude);
                        return {
                            latitude,
                            longitude,
                            mapsLink: `https://www.google.com/maps/place/${latitude}+${longitude}/@${latitude},${longitude},17z`,
                            success: true,
                            isLastKnown: true
                        };
                    }
                } catch (lkError) {
                    console.warn('📍 Native: Last known location retrieval failed:', lkError);
                }

                // Fallback B: Try low accuracy location (uses network/cell tower instead of GPS hardware)
                try {
                    console.log('📍 Native: Attempting low accuracy getCurrentPosition...');
                    const position = await Geolocation.getCurrentPosition({
                        enableHighAccuracy: false,
                        timeout: 10000, 
                        maximumAge: 30000 // Allow 30 seconds old location
                    });
                    
                    const { latitude, longitude } = position.coords;
                    console.log('✅ Native: Low accuracy location obtained:', latitude, longitude);
                    return {
                        latitude,
                        longitude,
                        mapsLink: `https://www.google.com/maps/place/${latitude}+${longitude}/@${latitude},${longitude},17z`,
                        success: true
                    };
                } catch (lowAccuracyError) {
                    console.error('📍 Native: Low accuracy failed as well:', lowAccuracyError);
                    throw lowAccuracyError; // Escalate to IP fallback
                }
            }
        } else {
            // Browser Fallback
            if (!navigator.geolocation) {
                throw new Error('UNSUPPORTED');
            }
            
            const position = await new Promise((resolve, reject) => {
                // Try high accuracy first
                console.log('📡 Browser: Attempting high accuracy...');
                navigator.geolocation.getCurrentPosition(resolve, (err) => {
                    console.warn('📡 Browser: High accuracy failed, trying low accuracy...', err);
                    // Fallback to low accuracy
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: false,
                        timeout: 10000,
                        maximumAge: 30000
                    });
                }, {
                    enableHighAccuracy: true,
                    timeout: 6000,
                    maximumAge: 0
                });
            });
            
            const { latitude, longitude } = position.coords;
            console.log('✅ Browser: Geolocation obtained:', latitude, longitude);
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
        // Try multiple reliable providers that support HTTPS for free
        const ipProviders = [
            { url: 'https://ipwho.is', latKey: 'latitude', lonKey: 'longitude' },
            { url: 'https://freeipapi.com/api/json', latKey: 'latitude', lonKey: 'longitude' },
            { url: 'https://ipapi.co/json/', latKey: 'latitude', lonKey: 'longitude' },
            { url: 'http://ip-api.com/json', latKey: 'lat', lonKey: 'lon' } // HTTP only fallback
        ];
 
        for (const provider of ipProviders) {
            try {
                console.log(`📡 Attempting IP-based fallback: ${provider.url}`);
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 4000);
                
                const response = await fetch(provider.url, { signal: controller.signal });
                clearTimeout(timeoutId);
                
                const data = await response.json();
                const lat = data[provider.latKey];
                const lon = data[provider.lonKey];
 
                if (lat && lon) {
                    console.log(`✅ IP-based geolocation successful using ${provider.url}:`, lat, lon);
                    return {
                        latitude: lat,
                        longitude: lon,
                        mapsLink: `https://www.google.com/maps/place/${lat}+${lon}/@${lat},${lon},17z`,
                        success: true,
                        isIPFallback: true
                    };
                }
            } catch (ipError) {
                console.warn(`❌ IP Fallback failed for ${provider.url}:`, ipError.message);
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
