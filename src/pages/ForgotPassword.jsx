import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader, CheckCircle } from 'lucide-react';
import { apiService } from '../utils/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState('');

    const submitHandler = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            await apiService.forgotPassword(email);
            setIsSent(true);
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                <div className="text-center">
                    <h2 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
                        Forgot Password?
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {isSent
                            ? "If an account exists, a reset link has been sent."
                            : "Enter your email address to reset your password"
                        }
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-md">
                        <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                    </div>
                )}

                {isSent ? (
                    <div className="text-center space-y-6">
                        <div className="flex justify-center">
                            <CheckCircle className="h-16 w-16 text-green-500" />
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                            If an account with <strong>{email}</strong> exists, we have sent a password reset link.
                            Please check your inbox (and spam folder).
                        </p>
                        <div className="pt-4">
                            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                                Back to Login
                            </Link>
                        </div>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={submitHandler}>
                        <div>
                            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-gray-50 dark:bg-gray-700 transition-colors duration-200"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                {isSubmitting ? (
                                    <Loader className="animate-spin h-5 w-5" />
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>
                        </div>

                        <div className="text-center">
                            <Link to="/login" className="flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
