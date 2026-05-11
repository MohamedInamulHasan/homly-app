import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { User, Mail, Lock, ArrowRight, Loader, Eye, EyeOff } from 'lucide-react';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState(null);

    const { register, error, user } = useContext(AuthContext);
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);




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
        <div className="min-h-screen flex items-center justify-center bg-[#CBF9B2] dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-700">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-[#2E5A2E] rounded-xl flex items-center justify-center mb-6 transform -rotate-3">
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
                                    {message ? t(message) : t(error)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <form className="mt-8 space-y-5" onSubmit={submitHandler}>
                    <div className="space-y-5">
                        <div className="group">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    autoComplete="name"
                                    required
                                    className="appearance-none relative block w-full pl-11 pr-12 py-3.5 border border-gray-200 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:border-[#2E5A2E] focus:ring-0 shadow-none focus:z-10 sm:text-sm bg-gray-50/50 dark:bg-gray-700/50 [-webkit-tap-highlight-color:transparent]"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="group">
                            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Email address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none relative block w-full pl-11 pr-12 py-3.5 border border-gray-200 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:border-[#2E5A2E] focus:ring-0 shadow-none focus:z-10 sm:text-sm bg-gray-50/50 dark:bg-gray-700/50 [-webkit-tap-highlight-color:transparent]"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="group">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    className="appearance-none relative block w-full pl-11 pr-12 py-3.5 border border-gray-200 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:border-[#2E5A2E] focus:ring-0 shadow-none focus:z-10 sm:text-sm bg-gray-50/50 dark:bg-gray-700/50 [-webkit-tap-highlight-color:transparent]"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-20"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                        <div className="group">
                            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="confirm-password"
                                    name="confirm-password"
                                    type={showConfirmPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    className="appearance-none relative block w-full pl-11 pr-12 py-3.5 border border-gray-200 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:border-[#2E5A2E] focus:ring-0 shadow-none focus:z-10 sm:text-sm bg-gray-50/50 dark:bg-gray-700/50 [-webkit-tap-highlight-color:transparent]"
                                    placeholder="Confirm your password"
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
                            className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-full text-white bg-[#2E5A2E] hover:bg-[#1E3A1E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E5A2E] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
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



                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-[#2E5A2E] hover:text-[#1E3A1E] dark:text-green-400 dark:hover:text-green-300 transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
