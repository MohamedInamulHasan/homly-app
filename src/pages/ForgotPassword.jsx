import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader, CheckCircle, Navigation } from 'lucide-react';
import { apiService } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState('');
    const { t } = useLanguage();

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
        <div className="min-h-screen flex items-center justify-center bg-[#CBF9B2] dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-700">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-[#2E5A2E] rounded-xl flex items-center justify-center mb-6 transform -rotate-3">
                        <Mail className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="mt-2 text-3xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        {isSent ? t('Check Your Email') : t('Forgot Password?')}
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 px-4">
                        {isSent
                            ? t("If an account exists, a reset link has been sent to your email.")
                            : t("Don't worry! Enter your email below to receive a password reset link.")
                        }
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-2xl">
                        <p className="text-sm text-red-700 dark:text-red-200 font-medium">{t(error)}</p>
                    </div>
                )}

                {isSent ? (
                    <div className="text-center space-y-8 py-4">
                        <div className="relative flex justify-center">
                            <div className="absolute inset-0 bg-[#CBF9B2]/30 rounded-full blur-xl scale-150 animate-pulse" />
                            <CheckCircle className="h-20 w-20 text-[#2E5A2E] relative z-10" />
                        </div>
                        
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed px-2">
                                {t('We have sent a secure link to')} <span className="font-bold text-[#2E5A2E]">{email}</span>. 
                                {t('Please click the link in that email to reset your password.')}
                            </p>
                            
                            <div className="pt-6">
                                <Link 
                                    to="/login" 
                                    className="inline-flex items-center justify-center w-full py-4 px-6 rounded-full bg-[#2E5A2E] text-white font-bold text-sm hover:bg-[#1E3A1E] transition-all transform active:scale-95"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    {t('Back to Login')}
                                </Link>
                            </div>

                            <button 
                                onClick={() => setIsSent(false)}
                                className="text-xs font-bold text-[#2E5A2E] hover:underline"
                            >
                                {t('Didn\'t receive it? Try again')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <form className="mt-8 space-y-8" onSubmit={submitHandler}>
                        <div>
                            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1">
                                {t('Email address')}
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-[#2E5A2E] transition-colors" />
                                </div>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none relative block w-full pl-11 pr-4 py-4 border border-gray-200 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:border-[#2E5A2E] focus:ring-0 sm:text-sm bg-gray-50/50 dark:bg-gray-700/50 transition-all"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-full text-white bg-[#2E5A2E] hover:bg-[#1E3A1E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E5A2E] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <Loader className="animate-spin h-5 w-5" />
                                ) : (
                                    t('Send Reset Link')
                                )}
                            </button>

                            <Link 
                                to="/login" 
                                className="flex items-center justify-center text-sm font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                {t('Back to Login')}
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
