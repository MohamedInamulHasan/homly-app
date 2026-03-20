import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Custom hook to handle Android back button navigation
 * Prevents app from closing when navigating between pages
 */
export const useBackButton = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const locationRef = useRef(location);

    // Update location ref whenever location changes
    useEffect(() => {
        locationRef.current = location;
    }, [location]);

    useEffect(() => {
        // Only set up back button handler in Capacitor environment (not browser)
        if (typeof window !== 'undefined' && window.Capacitor) {
            let listenerHandle;
            let isMounted = true;

            const setupListener = async () => {
                try {
                    // Dynamic import for Capacitor App
                    const { App: CapacitorApp } = await import('@capacitor/app');

                    const handle = await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
                        const currentLocation = locationRef.current;
                        // If we're on the home page, exit the app
                        if (currentLocation.pathname === '/' || currentLocation.pathname === '/home') {
                            CapacitorApp.exitApp();
                        } else {
                            // Otherwise, navigate back in history
                            navigate(-1);
                        }
                    });

                    if (isMounted) {
                        listenerHandle = handle;
                    } else {
                        handle.remove();
                    }
                } catch (error) {
                    console.error('Failed to setup back button listener:', error);
                }
            };

            setupListener();

            // Cleanup listener on unmount
            return () => {
                isMounted = false;
                if (listenerHandle) {
                    listenerHandle.remove();
                }
            };
        }
    }, [navigate]); // Removed location from deps to prevent re-registration
};

export default useBackButton;
