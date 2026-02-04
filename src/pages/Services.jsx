import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wrench, ShieldCheck, MapPin, CheckCircle, Calendar, Minus, Plus, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import PullToRefreshLayout from '../components/PullToRefreshLayout';

const Services = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { services, loading, requestService } = useData();
    const [selectedService, setSelectedService] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [requestSuccess, setRequestSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRequestService = (service) => {
        setSelectedService(service);
        setShowConfirmation(true);
    };

    const confirmRequest = async () => {
        if (!selectedService) return;

        setIsSubmitting(true);
        try {
            await requestService(selectedService._id || selectedService.id);
            setShowConfirmation(false);
            setTimeout(() => {
                setRequestSuccess(true);
                setIsSubmitting(false);
            }, 300);
        } catch (error) {
            console.error("Failed to request service:", error);
            setIsSubmitting(false);
            alert(t('Failed to request service. Please try again.'));
        }
    };





    return (
        <PullToRefreshLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                {/* Header Section */}
                <div className="relative bg-white dark:bg-gray-800 pb-12 pt-8 rounded-b-[3rem] shadow-sm mb-8 overflow-hidden">
                    <div className="absolute top-0 left-0 p-8 opacity-5 pointer-events-none">
                        <Wrench size={180} className="text-blue-500 transform -rotate-12" />
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <ArrowLeft className="h-6 w-6" />
                            </button>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-4 tracking-tight">
                            {t('Premium Services')}
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl font-medium">
                            {t('Professional services at your doorstep. Fast, reliable, and secure.')}
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {loading.services ? (
                            // Skeleton Loader
                            [...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white dark:bg-gray-800 rounded-3xl h-[400px] shadow-sm border border-gray-100 dark:border-gray-700/50 animate-pulse" />
                            ))
                        ) : services.length > 0 ? (
                            services.map((service, index) => (
                                <div key={service._id || index} className="group relative bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-80 md:h-96 w-full">

                                    {/* Full Background Image */}
                                    <div className="absolute inset-0">
                                        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
                                        <img
                                            src={service.image}
                                            alt={service.name}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                                            onError={(e) => { e.target.style.opacity = 0; }}
                                        />
                                        {/* Gradient Overlay for Text Readability */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                                    </div>

                                    {/* Top Badge */}
                                    <div className="absolute top-4 left-4 z-20">
                                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/20 rounded-full text-xs font-bold text-white shadow-sm flex items-center gap-1.5 uppercase tracking-wider">
                                            {service.category || 'Service'}
                                        </span>
                                    </div>

                                    {/* Bottom Content Overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 z-20 flex flex-col justify-end h-full">

                                        <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                            <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2 leading-tight drop-shadow-md">
                                                {service.name}
                                            </h3>

                                            <div className="flex items-center gap-2 text-gray-300 text-sm mb-4">
                                                <MapPin size={16} className="text-blue-400 shrink-0" />
                                                <span className="line-clamp-1 border-b border-dashed border-gray-500 pb-0.5">{service.address}</span>
                                            </div>

                                            {/* Action Button - Always visible or appearing on hover? Keeping always visible for mobile usage */}
                                            <button
                                                onClick={() => handleRequestService(service)}
                                                className="w-full py-3.5 bg-white text-gray-900 rounded-2xl font-bold text-sm shadow-lg shadow-black/20 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 mt-2"
                                            >
                                                {t('Request Now')}
                                                <ArrowLeft size={18} className="rotate-180" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                                    <Wrench size={40} className="text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('No Services Found')}</h3>
                                <p className="text-gray-500 dark:text-gray-400">{t('Check back later for new services.')}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Confirmation Modal */}
                {showConfirmation && selectedService && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all scale-100 opacity-100">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ShieldCheck className="text-blue-600 dark:text-blue-400" size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    {t('Confirm Request')}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    {t('Are you sure you want to request')} <span className="font-semibold text-gray-900 dark:text-white">"{selectedService.name}"</span>?
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirmation(false)}
                                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    {t('Cancel')}
                                </button>
                                <button
                                    onClick={confirmRequest}
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                                >
                                    {t('Confirm')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success Modal */}
                {requestSuccess && selectedService && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6 transform transition-all scale-100 opacity-100">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="text-green-600 dark:text-green-400" size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    {t('Request Sent!')}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    {t('Your request for')} <span className="font-semibold text-gray-900 dark:text-white">"{selectedService.name}"</span> {t('has been received')}.
                                    <br />
                                    {t('Our team will contact you shortly at')} <span className="font-semibold text-blue-600">{selectedService.mobile}</span>.
                                </p>
                            </div>
                            <button
                                onClick={() => setRequestSuccess(false)}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                            >
                                {t('Close')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </PullToRefreshLayout>
    );
};

export default Services;
