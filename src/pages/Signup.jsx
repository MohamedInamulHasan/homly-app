import { useState, useContext, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { User, Mail, Lock, ArrowRight, Loader, Eye, EyeOff } from 'lucide-react';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState(null);

    const { register, googleLogin, error, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const googleLoginHandler = useGoogleLogin({
        onSuccess: async (codeResponse) => {
            setIsSubmitting(true);
            // Pass access_token for Implicit Flow verification
            const success = await googleLogin({ accessToken: codeResponse.access_token });
            if (success) {
                // Check for saved redirect
                const savedRedirect = sessionStorage.getItem('redirectAfterLogin');
                if (savedRedirect) {
                    sessionStorage.removeItem('redirectAfterLogin');
                    navigate(savedRedirect);
                } else {
                    // Force reload to ensure Navbar updates
                    window.location.href = '/';
                }
            }
            setIsSubmitting(false);
        },
        onError: (error) => {
            console.error('Login Failed:', error);
            setIsSubmitting(false);
        }
    });


    useEffect(() => {
        if (user) {
            // Check if there's a saved redirect path from checkout
            const savedRedirect = sessionStorage.getItem('redirectAfterLogin');
            if (savedRedirect) {
                sessionStorage.removeItem('redirectAfterLogin');
                navigate(savedRedirect);
            } else {
                // Always go to home page after signup
                navigate('/');
            }
        }
    }, [navigate, user]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setMessage(null);

        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        setIsSubmitting(true);
        const success = await register(name, email, password);
        if (success) {
            // Check for saved redirect
            const savedRedirect = sessionStorage.getItem('redirectAfterLogin');
            if (savedRedirect) {
                sessionStorage.removeItem('redirectAfterLogin');
                navigate(savedRedirect);
            }
        }
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="max-w-md w-full space-y-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg mb-6 transform -rotate-3">
                        <User className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="mt-2 text-3xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        Create Account
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Join us and start shopping today
                    </p>
                </div>

                {(message || error) && (
                    <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-md">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700 dark:text-red-200">
                                    {message || error}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <form className="mt-8 space-y-5" onSubmit={submitHandler}>
                    <div className="space-y-5">
                        <div className="group">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 transition-colors group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    className="appearance-none relative block w-full pl-11 pr-4 py-3.5 border border-gray-200 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:z-10 sm:text-sm bg-gray-50/50 dark:bg-gray-700/50 transition-all duration-200"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="group">
                            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 transition-colors group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400">
                                Email address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none relative block w-full pl-11 pr-4 py-3.5 border border-gray-200 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:z-10 sm:text-sm bg-gray-50/50 dark:bg-gray-700/50 transition-all duration-200"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="group">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 transition-colors group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    className="appearance-none relative block w-full pl-11 pr-12 py-3.5 border border-gray-200 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:z-10 sm:text-sm bg-gray-50/50 dark:bg-gray-700/50 transition-all duration-200"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-20 transition-colors"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                        <div className="group">
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 transition-colors group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    id="confirm-password"
                                    name="confirm-password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    className="appearance-none relative block w-full pl-11 pr-12 py-3.5 border border-gray-200 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:z-10 sm:text-sm bg-gray-50/50 dark:bg-gray-700/50 transition-all duration-200"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-20 transition-colors"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5"
                        >
                            {isSubmitting ? (
                                <Loader className="animate-spin h-5 w-5" />
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or sign up with</span>
                    </div>
                </div>

                <div>
                    <button
                        type="button"
                        onClick={() => googleLoginHandler()}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700 text-gray-700 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        <span>Sign up with Google</span>
                    </button>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
