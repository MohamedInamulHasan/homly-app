import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Mail, Lock, ArrowRight, Loader, Eye, EyeOff } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, googleLogin, error, user } = useContext(AuthContext);
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);




    // Get redirect param from URL
    const location = window.location;
    const queryParams = new URLSearchParams(location.search);
    const redirect = queryParams.get('redirect');

    useEffect(() => {
        if (user) {
            // Check if there's a saved redirect path from checkout
            const savedRedirect = sessionStorage.getItem('redirectAfterLogin');
            if (savedRedirect) {
                sessionStorage.removeItem('redirectAfterLogin');
                navigate(savedRedirect);
            } else {
                // Only force delivery boys directly to the admin dashboard. 
                // Global admins, store admins, etc. may want to see the storefront first.
                const roles = Array.isArray(user.role) ? user.role : [user.role || 'customer'];
                const isDeliveryBoy = roles.some(r => {
                    const normalized = String(r || '').toLowerCase().trim();
                    return normalized === 'delivery_boy' || normalized === 'deliveryboy';
                });

                if (isDeliveryBoy) {
                    navigate('/admin');
                } else {
                    // Always go to home page after login for regular users, admins, store admins, and service admins
                    navigate('/');
                }
            }
        }
    }, [navigate, user]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const success = await login(email, password);
        if (success) {
            // Check for saved redirect
            const savedRedirect = sessionStorage.getItem('redirectAfterLogin');
            if (savedRedirect) {
                sessionStorage.removeItem('redirectAfterLogin');
                navigate(savedRedirect);
            } else {
                // The Context doesn't return the full user immediately here in submitHandler, 
                // but useEffect will catch it. If needed, we just let useEffect handle the default routing.
            }
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

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-md">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700 dark:text-red-200">
                                    {t(error)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col items-center justify-center w-full gap-4">
                    <GoogleLogin
                        onSuccess={async (credentialResponse) => {
                            setIsSubmitting(true);
                            const success = await googleLogin({ credential: credentialResponse.credential });
                            setIsSubmitting(false);
                            if (success) {
                                const savedRedirect = sessionStorage.getItem('redirectAfterLogin');
                                if (savedRedirect) {
                                    sessionStorage.removeItem('redirectAfterLogin');
                                    navigate(savedRedirect);
                                }
                            }
                        }}
                        onError={() => {
                            console.error('Google Login Failed');
                        }}
                        theme="outline"
                        size="large"
                        shape="pill"
                        width="300"
                    />
                </div>
            </div>
        </div>
    );
};

export default Login;
