import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Lock, Loader } from 'lucide-react';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

const Login = () => {
    const { googleLogin, error, user } = useContext(AuthContext);
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loginError, setLoginError] = useState(null);

    // Retrieve client ID
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    useEffect(() => {
        if (user) {
            const savedRedirect = sessionStorage.getItem('redirectAfterLogin');
            if (savedRedirect) {
                sessionStorage.removeItem('redirectAfterLogin');
                navigate(savedRedirect);
            } else {
                const roles = Array.isArray(user.role) ? user.role : [user.role || 'customer'];
                const isDeliveryBoy = roles.some(r => {
                    const normalized = String(r || '').toLowerCase().trim();
                    return normalized === 'delivery_boy' || normalized === 'deliveryboy';
                });
                if (isDeliveryBoy) {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            }
        }
    }, [navigate, user]);

    // Handle OAuth Callback/Token handling from URL redirect
    useEffect(() => {
        const handleCallback = async () => {
            const hash = window.location.hash;
            if (hash) {
                const params = new URLSearchParams(hash.replace('#', '?'));
                const accessToken = params.get('access_token');
                if (accessToken) {
                    setIsSubmitting(true);
                    setLoginError(null);
                    // Clear the hash in URL
                    window.history.replaceState(null, null, ' ');
                    try {
                        const success = await googleLogin({ accessToken });
                        if (success) {
                            const savedRedirect = sessionStorage.getItem('redirectAfterLogin');
                            if (savedRedirect) {
                                sessionStorage.removeItem('redirectAfterLogin');
                                navigate(savedRedirect);
                            }
                        }
                    } catch (err) {
                        setLoginError('Google Sign-In failed. Please try again.');
                    }
                    setIsSubmitting(false);
                }
            }
        };

        handleCallback();

        // Listen for Capacitor App Url Open events (handles login completion redirect back to app)
        if (Capacitor.isNativePlatform()) {
            const setupAppListener = async () => {
                const { App } = await import('@capacitor/app');
                App.addListener('appUrlOpen', async (data) => {
                    const url = new URL(data.url);
                    // Check if redirect contains access token in hash or params
                    const hashParams = new URLSearchParams(url.hash.replace('#', '?'));
                    const accessToken = hashParams.get('access_token') || url.searchParams.get('access_token');
                    
                    if (accessToken) {
                        setIsSubmitting(true);
                        setLoginError(null);
                        try {
                            const success = await googleLogin({ accessToken });
                            if (success) {
                                // Close the browser tab if still open
                                await Browser.close();
                                const savedRedirect = sessionStorage.getItem('redirectAfterLogin');
                                if (savedRedirect) {
                                    sessionStorage.removeItem('redirectAfterLogin');
                                    navigate(savedRedirect);
                                }
                            }
                        } catch (err) {
                            setLoginError('Google Sign-In failed. Please try again.');
                        }
                        setIsSubmitting(false);
                    }
                });
            };
            setupAppListener();
        }
    }, [googleLogin, navigate]);

    const handleGoogleLogin = async () => {
        setIsSubmitting(true);
        setLoginError(null);

        // Determine redirect URI: localhost for local dev/app, or Vercel domain for prod
        let redirectUri = window.location.origin;
        if (Capacitor.isNativePlatform()) {
            // Android uses com.ilayangudimart.app as scheme or localhost
            redirectUri = 'https://localhost';
        }

        // Construct Google OAuth URL manually
        const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${clientId}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&response_type=token` +
            `&scope=${encodeURIComponent('openid profile email')}` +
            `&prompt=select_account`;

        try {
            if (Capacitor.isNativePlatform()) {
                // Open inside custom Chrome tab / Safari View Controller
                await Browser.open({ url: oauthUrl });
            } else {
                // Open in same window on standard browser
                window.location.href = oauthUrl;
            }
        } catch (err) {
            setLoginError('Could not open login page. Please try again.');
        }
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#CBF9B2] dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-700">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-[#2E5A2E] dark:bg-[#CBF9B2] rounded-xl flex items-center justify-center mb-6 transform rotate-3">
                        <Lock className="h-6 w-6 text-white dark:text-gray-900" />
                    </div>
                    <h2 className="mt-2 text-3xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
                        Sign in to access your account using Google
                    </p>
                </div>

                {(error || loginError) && (
                    <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-md">
                        <p className="text-sm text-red-700 dark:text-red-200">
                            {loginError || t(error)}
                        </p>
                    </div>
                )}

                <div className="flex flex-col items-center justify-center w-full gap-4">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isSubmitting}
                        className="flex items-center justify-center gap-3 w-full max-w-xs py-3 px-6 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <Loader className="animate-spin h-5 w-5 text-gray-500" />
                        ) : (
                            <>
                                {/* Google Logo SVG */}
                                <svg width="20" height="20" viewBox="0 0 48 48">
                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                                </svg>
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                    Sign in with Google
                                </span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
