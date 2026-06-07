import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, Loader, CheckCircle, AlertTriangle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { apiService } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const submitHandler = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsSubmitting(true);

        try {
            await apiService.resetPassword(token, password);
            setIsSuccess(true);
            // Redirect after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.message || 'Invalid or expired token. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#CBF9B2] dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-700">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-[#2E5A2E] dark:bg-[#CBF9B2] rounded-xl flex items-center justify-center mb-6 transform rotate-3">
                        <Lock className="h-6 w-6 text-white dark:text-gray-900" />
                    </div>
                    <h2 className="mt-2 text-3xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        {isSuccess ? t('Success!') : t('New Password')}
                    </h2>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        {isSuccess
                            ? t("Your password has been reset. Redirecting to login...")
                            : t("Create a strong new password for your account")
                        }
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-2xl flex items-start">
                        <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-700 dark:text-red-200 font-medium">{t(error)}</p>
                    </div>
                )}

                {isSuccess ? (
                    <div className="text-center space-y-8 py-4">
                        <div className="relative flex justify-center">
                            <div className="absolute inset-0 bg-[#CBF9B2]/30 rounded-full blur-xl scale-150 animate-pulse" />
                            <CheckCircle className="h-20 w-20 text-[#2E5A2E] dark:text-[#CBF9B2] relative z-10" />
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                            {t('Your password is now updated.')} <br />
                            {t('You will be redirected to the login page automatically.')}
                        </p>
                        
                        <div className="pt-4">
                            <Link 
                                to="/login" 
                                className="inline-flex items-center justify-center w-full py-4 px-6 rounded-full bg-[#2E5A2E] dark:bg-[#CBF9B2] text-white dark:text-gray-900 font-bold text-sm hover:bg-[#1E3A1E] dark:hover:bg-[#a6d98e] transition-all transform active:scale-95"
                            >
                                {t('Login Now')}
                                <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                            </Link>
                        </div>
                    </div>
                ) : (
                    <form className="mt-8 space-y-6" onSubmit={submitHandler}>
                        <div className="space-y-5">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1">
                                    {t('New Password')}
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#2E5A2E] dark:group-focus-within:text-[#CBF9B2] transition-colors" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="appearance-none relative block w-full pl-11 pr-12 py-4 border border-gray-200 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:border-[#2E5A2E] dark:focus:border-[#CBF9B2] focus:ring-0 sm:text-sm bg-gray-50/50 dark:bg-gray-700/50 transition-all"
                                        placeholder={t('Min 6 characters')}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        minLength={6}
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

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 ml-1">
                                    {t('Confirm Password')}
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#2E5A2E] dark:group-focus-within:text-[#CBF9B2] transition-colors" />
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className="appearance-none relative block w-full pl-11 pr-12 py-4 border border-gray-200 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white rounded-2xl focus:outline-none focus:border-[#2E5A2E] dark:focus:border-[#CBF9B2] focus:ring-0 sm:text-sm bg-gray-50/50 dark:bg-gray-700/50 transition-all"
                                        placeholder={t('Repeat password')}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-full text-white dark:text-gray-900 bg-[#2E5A2E] dark:bg-[#CBF9B2] hover:bg-[#1E3A1E] dark:hover:bg-[#a6d98e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E5A2E] dark:focus:ring-[#CBF9B2] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <Loader className="animate-spin h-5 w-5" />
                                ) : (
                                    t('Reset Password')
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;
