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
