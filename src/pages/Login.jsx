import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Lock, Loader } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

// The Vercel URL where Google will redirect after login.
// This MUST match what is registered in Google Cloud Console as an Authorised redirect URI.
const VERCEL_REDIRECT_URI = 'https://homly-app.vercel.app/login';

const Login = () => {
    const { googleLogin, error, user } = useContext(AuthContext);
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loginError, setLoginError] = useState(null);

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    // Redirect already-logged-in users
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
                navigate(isDeliveryBoy ? '/admin' : '/');
            }
        }
    }, [navigate, user]);

    // ─── Case A: Running in a REAL browser (Vercel / desktop) ───────────────────
    // Standard web OAuth: Google redirects back here with token in URL hash.
    // Also handles the "bridge" step: when Chrome Custom Tab loads the Vercel page
    // after Google auth, we detect the token and redirect to the app custom scheme.
    useEffect(() => {
        const hash = window.location.hash;
        if (!hash) return;

        const params = new URLSearchParams(hash.replace('#', ''));
        const accessToken = params.get('access_token');
        if (!accessToken) return;

        // Clear token from URL immediately so it doesn't leak
        window.history.replaceState(null, '', window.location.pathname);

        if (!Capacitor.isNativePlatform()) {
            // We are running on Vercel (real browser / Chrome Custom Tab).
            
            // Build an Android Intent URI. Chrome Custom Tab on Android recognises this format
            // and natively launches the app matching the package name.
            const intentUrl = `intent://login#access_token=${accessToken}#Intent;scheme=com.ilayangudimart.app;package=com.ilayangudimart.app;end;`;
            const deepLink = `com.ilayangudimart.app://login#access_token=${accessToken}`;

            if (/android/i.test(navigator.userAgent)) {
                window.location.href = intentUrl;
            } else {
                window.location.href = deepLink;
            }

            // Fallback: if still on the page after 2.5s (e.g., desktop browser), do web login
            const fallbackTimer = setTimeout(async () => {
                setIsSubmitting(true);
                setLoginError(null);
                try {
                    const success = await googleLogin({ accessToken });
                    if (success) {
                        const savedRedirect = sessionStorage.getItem('redirectAfterLogin');
                        if (savedRedirect) {
                            sessionStorage.removeItem('redirectAfterLogin');
                            navigate(savedRedirect);
                        } else {
                            navigate('/');
                        }
                    } else {
                        setLoginError('Google Sign-In failed. Please try again.');
                    }
                } catch {
                    setLoginError('Google Sign-In failed. Please try again.');
                }
                setIsSubmitting(false);
            }, 2500);

            return () => clearTimeout(fallbackTimer);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─── Case B: Running inside the Capacitor Android app ───────────────────────
    // Reads pending token from localStorage (captured by the global App.jsx listener)
    // or waits for the custom 'pendingTokenReceived' event to fire if already mounted.
    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        const checkAndLogin = async () => {
            const pendingToken = localStorage.getItem('pending_google_access_token');
            if (!pendingToken) return;

            // Consume it immediately
            localStorage.removeItem('pending_google_access_token');

            setIsSubmitting(true);
            setLoginError(null);
            try {
                const success = await googleLogin({ accessToken: pendingToken });
                if (success) {
                    const savedRedirect = sessionStorage.getItem('redirectAfterLogin');
                    if (savedRedirect) {
                        sessionStorage.removeItem('redirectAfterLogin');
                        navigate(savedRedirect);
                    } else {
                        navigate('/');
                    }
                } else {
                    setLoginError('Google Sign-In failed. Please try again.');
                }
            } catch {
                setLoginError('Google Sign-In failed. Please try again.');
            }
            setIsSubmitting(false);
        };

        // Check on mount (handles cold starts where token was captured before mount)
        checkAndLogin();

        // Listen for new token events (handles cases where login screen is already open)
        window.addEventListener('pendingTokenReceived', checkAndLogin);

        return () => {
            window.removeEventListener('pendingTokenReceived', checkAndLogin);
        };
    }, [googleLogin, navigate]);

    const handleGoogleLogin = async () => {
        setIsSubmitting(true);
        setLoginError(null);

        // Always use the Vercel URL as redirect_uri so Google doesn't block it.
        // On Android: Chrome Custom Tab opens Google → redirects to Vercel → Vercel page
        //             sends deep link → app receives appUrlOpen with token.
        // On browser: Google → redirects to Vercel → Vercel page handles web login directly.
        const redirectUri = Capacitor.isNativePlatform()
            ? VERCEL_REDIRECT_URI
            : window.location.origin;

        const oauthUrl =
            `https://accounts.google.com/o/oauth2/v2/auth` +
            `?client_id=${clientId}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&response_type=token` +
            `&scope=${encodeURIComponent('openid profile email')}` +
            `&prompt=select_account`;

        if (Capacitor.isNativePlatform()) {
            try {
                const { Browser } = await import('@capacitor/browser');
                // Chrome Custom Tab — NOT blocked by Google (unlike embedded WebView)
                await Browser.open({ url: oauthUrl });
            } catch {
                setLoginError('Could not open login page. Please try again.');
            }
        } else {
            // Standard browser: redirect in the same tab
            window.location.href = oauthUrl;
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
                        className="flex items-center justify-center gap-3 w-full max-w-xs py-3 px-6 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <Loader className="animate-spin h-5 w-5 text-gray-500" />
                        ) : (
                            <>
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
