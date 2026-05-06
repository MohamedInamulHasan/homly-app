import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock, Eye, FileText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const PrivacyPolicy = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-[#CBF9B2] rounded-b-[2.5rem] px-5 py-4 shadow-sm">
                <div className="max-w-xl mx-auto flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="w-11 h-11 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-sm text-gray-900 dark:text-white transition-transform active:scale-95">
                        <ArrowLeft size={22} />
                    </button>
                    <div className="flex flex-col text-center">
                        <h1 className="text-[18px] font-bold text-gray-900 dark:text-white tracking-tight">{t('Privacy Policy')}</h1>
                        <p className="text-[11px] font-medium text-gray-500 dark:text-gray-400 mt-0.5">{t('Last Updated: May 2026')}</p>
                    </div>
                    <div className="w-11" />
                </div>
            </div>

            <div className="pt-28 pb-12 max-w-3xl mx-auto px-6">
                <div className="bg-white dark:bg-gray-800 rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-gray-700 space-y-8 text-gray-700 dark:text-gray-300">
                    
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <ShieldCheck className="text-[#2E5A2E]" size={24} />
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('Introduction')}</h2>
                        </div>
                        <p className="leading-relaxed">
                            Welcome to Homly. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our application and tell you about your privacy rights.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Eye className="text-[#2E5A2E]" size={24} />
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('Data We Collect')}</h2>
                        </div>
                        <p className="mb-4">We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Identity Data:</strong> Includes first name, last name, and username.</li>
                            <li><strong>Contact Data:</strong> Includes email address and telephone numbers.</li>
                            <li><strong>Location Data:</strong> Includes your delivery address and GPS location to provide local services.</li>
                        </ul>
                        <p className="mt-4 italic text-sm text-[#2E5A2E] bg-[#E8F5E9] p-3 rounded-xl">
                            <strong>Note:</strong> Homly exclusively uses <strong>Cash on Delivery (COD)</strong>. We do not collect or store credit card details or any other online payment information.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Lock className="text-[#2E5A2E]" size={24} />
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('How We Use Your Data')}</h2>
                        </div>
                        <p className="mb-4">We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>To register you as a new customer.</li>
                            <li>To process and deliver your orders.</li>
                            <li>To manage our relationship with you (e.g. notifying you about changes to our terms or privacy policy).</li>
                            <li>To improve our website, products/services, and user experience.</li>
                        </ul>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="text-[#2E5A2E]" size={24} />
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('Your Legal Rights')}</h2>
                        </div>
                        <p className="leading-relaxed">
                            Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, or to object to processing.
                        </p>
                    </section>

                    <section className="pt-6 border-t border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('Contact Us')}</h2>
                        <p>If you have any questions about this privacy policy or our privacy practices, please contact us at:</p>
                        <p className="mt-2 font-bold text-[#2E5A2E]">support@homly.app</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
