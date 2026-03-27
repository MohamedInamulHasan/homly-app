import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Wrench, ShieldCheck, MapPin, CheckCircle, Phone, Send, Check, Search } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import PullToRefreshLayout from '../components/PullToRefreshLayout';
import { useServices, useServiceItems } from '../hooks/queries/useServices';
import { API_BASE_URL } from '../utils/api';

const Services = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { requestService, setIsFooterHidden } = useData();
    const { user } = useAuth(); // Get user for default address
    const [selectedService, setSelectedService] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [requestSuccess, setRequestSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [searchParams] = useSearchParams();
    const serviceIdFromQuery = searchParams.get('id');

    const [searchQuery, setSearchQuery] = useState('');

    // Dynamic Data Hooks
    const { data: services = [], isLoading: servicesLoading } = useServices();

    // Sub-services state
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'details'
    const [activeService, setActiveService] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);

    // Fetch items only when a service is active
    const { data: serviceItems = [], isLoading: itemsLoading } = useServiceItems(activeService?._id || activeService?.id);

    // Hide footer/navbar when modals are open
    useEffect(() => {
        setIsFooterHidden(showConfirmation || requestSuccess);
        return () => setIsFooterHidden(false); // Cleanup on unmount
    }, [showConfirmation, requestSuccess, setIsFooterHidden]);

    // Handle Deep Linking from Shop Toggle
    useEffect(() => {
        if (serviceIdFromQuery && services.length > 0) {
            const foundService = services.find(s => (s._id || s.id) === serviceIdFromQuery);
            if (foundService) {
                setActiveService(foundService);
                setViewMode('details');
            }
        }
    }, [serviceIdFromQuery, services]);

    const handleViewServices = (service) => {
        setActiveService(service);
        setSelectedItem(null); // Reset selection
        setViewMode('details');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSelectSubService = (sub) => {
        if (selectedItem?._id === sub._id) {
            setSelectedItem(null); // Deselect if already selected
        } else {
            setSelectedItem(sub);
        }
    };

    const handleRequestSubService = (subService) => {
        // Create a composite service object for the request
        const serviceRequest = {
            ...activeService,
            name: `${activeService.name} - ${subService.name}`, // Combine names for display
            originalId: activeService._id || activeService.id,
            itemId: subService._id || subService.id,
            price: subService.price
        };
        setSelectedService(serviceRequest);
        setShowConfirmation(true);
    };

    const confirmRequest = async () => {
        if (!selectedService) return;

        setIsSubmitting(true);
        try {
            // 1. Get Location Data
            let locationText = '';

            // Default to User Profile Address
            if (user?.address) {
                locationText = `${user.address.street || ''}, ${user.address.city || ''}`;
                if (user.address.state) locationText += `, ${user.address.state}`;
                if (user.address.zip) locationText += ` - ${user.address.zip}`;
            }

            // USE STORED LOCATION ONLY (As per user request for speed)
            // We do NOT detect location here anymore. We use the 'location' field from the user profile
            // which contains the Google Maps link saved during Checkout or previous interactions.
            const storedLocation = user?.location || '';

            // 2. Send Request
            // valid 'coordinates' field to backend is now the stored Maps Link or empty string
            await requestService(selectedService.originalId, {
                location: locationText,
                coordinates: storedLocation
            });

            // 3. No need to update profile as we are reading FROM it.

            setShowConfirmation(false);
            setTimeout(() => {
                setRequestSuccess(true);
                setIsSubmitting(false);
            }, 50);
        } catch (error) {
            console.error("Failed to request service:", error);
            setIsSubmitting(false);
            alert(t('Failed to request service. Please try again.'));
        }
    };

    const handleBackToList = () => {
        setViewMode('list');
        setActiveService(null);
    };

    return (
        <PullToRefreshLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                {/* Compact Header Section */}
                <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors duration-200 mb-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => viewMode === 'details' ? handleBackToList() : navigate(-1)}
                                className="p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors flex items-center gap-2"
                            >
                                <ArrowLeft className="h-6 w-6" />
                            </button>
                            <div>
                                <h1 className="text-xl md:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 leading-none flex items-center gap-2">
                                    <Wrench className="text-blue-600 dark:text-blue-400" size={24} />
                                    {viewMode === 'details' && activeService ? activeService.name : t('Premium Services')}
                                </h1>
                                {viewMode !== 'details' && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">
                                        {t('Expert solutions for your needs')}
                                    </p>
                                )}
                            </div>
                        </div>
                        {/* Right side action (optional) */}
                        <div className="w-8"></div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

                    {viewMode === 'list' && (
                        <div className="mb-8 flex justify-center md:justify-start sticky top-20 z-30">
                            <div className="relative w-full max-w-lg group">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={t('Search services...')}
                                    className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-blue-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 placeholder-gray-400 dark:placeholder-gray-500 shadow-md group-hover:shadow-lg focus:shadow-xl transition-all duration-300 text-sm"
                                />
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500 dark:text-blue-400 group-focus-within:scale-110 transition-transform" size={18} />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                                    >
                                        <ArrowLeft size={16} className="rotate-180" />
                                    </button>
                                )}
                            </div>

                            {/* Search Results Dropdown */}
                            {searchQuery.trim() && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-80 overflow-y-auto z-50 w-full overflow-x-hidden">
                                    {(() => {
                                        const q = searchQuery.toLowerCase();
                                        const results = services.filter(service =>
                                            service.name?.toLowerCase().includes(q) ||
                                            service.category?.toLowerCase().includes(q)
                                        ).sort((a, b) => {
                                            const aName = t(a, 'name').toLowerCase();
                                            const bName = t(b, 'name').toLowerCase();
                                            const aStarts = aName.startsWith(q);
                                            const bStarts = bName.startsWith(q);
                                            if (aStarts && !bStarts) return -1;
                                            if (!aStarts && bStarts) return 1;
                                            return 0;
                                        }).slice(0, 5);

                                        if (results.length === 0) {
                                            return (
                                                <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                                    {t('No services found')}
                                                </div>
                                            );
                                        }

                                        return results.map((service) => {
                                            const serviceId = service._id || service.id;

                                            return (
                                                <div
                                                    key={serviceId}
                                                    onClick={() => {
                                                        handleViewServices(service);
                                                        setSearchQuery('');
                                                    }}
                                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 text-left"
                                                >
                                                    <div className="relative flex-shrink-0">
                                                        <img
                                                            src={service.image || `${API_BASE_URL}/services/${serviceId}/image`}
                                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100?text=Service'; }}
                                                            alt={service.name}
                                                            className="w-10 h-10 rounded-lg object-cover border border-gray-100 dark:border-gray-700"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                            {(() => {
                                                                const fullTitle = t(service, 'name');
                                                                const bracketIndex = fullTitle.indexOf('(');
                                                                if (bracketIndex !== -1) {
                                                                    const mainPart = fullTitle.substring(0, bracketIndex);
                                                                    const bracketPart = fullTitle.substring(bracketIndex);
                                                                    return (
                                                                        <>
                                                                            <span>{mainPart}</span>
                                                                            <span className="text-[10px] font-normal text-gray-500 dark:text-gray-400">{bracketPart}</span>
                                                                        </>
                                                                    );
                                                                }
                                                                return fullTitle;
                                                            })()}
                                                        </div>
                                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                                                            {service.category || t('Service')}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            )}

                        </div>
                    )}

                    {viewMode === 'list' ? (
                        /* MAIN SERVICES LIST */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {servicesLoading ? (
                                // Enhanced Skeleton Loader
                                [...Array(6)].map((_, i) => (
                                    <div key={i} className="bg-white dark:bg-gray-800 rounded-3xl h-[400px] shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                                        <div className="relative h-full">
                                            {/* Image skeleton */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 animate-pulse" />
                                            {/* Content skeleton */}
                                            <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
                                                <div className="h-4 w-20 bg-white/30 rounded-full animate-pulse" />
                                                <div className="h-7 w-3/4 bg-white/40 rounded animate-pulse" />
                                                <div className="h-4 w-1/2 bg-white/30 rounded animate-pulse" />
                                                <div className="h-12 w-full bg-white/50 rounded-2xl animate-pulse mt-4" />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (() => {
                                const filteredServices = services.filter(service =>
                                    service.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    service.category?.toLowerCase().includes(searchQuery.toLowerCase())
                                );

                                if (filteredServices.length === 0) {
                                    return (
                                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                                            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                                                <Wrench size={40} className="text-gray-400" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('No Services Found')}</h3>
                                            <p className="text-gray-500 dark:text-gray-400">{t('Try searching for something else.')}</p>
                                        </div>
                                    );
                                }

                                return filteredServices.map((service, index) => (
                                    <div key={service._id || index} className="group relative bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-80 md:h-96 w-full">

                                        {/* Full Background Image */}
                                        <div className="absolute inset-0">
                                            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
                                            <img
                                                src={service.image || `${API_BASE_URL}/services/${service._id || service.id}/image`}
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

                                                <div className="flex flex-col gap-1 mb-4">
                                                    <div className="flex items-center gap-2 text-gray-300 text-sm">
                                                        <MapPin size={16} className="text-blue-400 shrink-0" />
                                                        <span className="line-clamp-1 border-b border-dashed border-gray-500 pb-0.5">{service.address || 'Available Locally'}</span>
                                                    </div>
                                                </div>

                                                {/* Action Button: View Services */}
                                                <button
                                                    onClick={() => handleViewServices(service)}
                                                    className="w-full py-3.5 bg-white text-gray-900 rounded-2xl font-bold text-sm shadow-lg shadow-black/20 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 mt-2"
                                                >
                                                    {t('View Services')}
                                                    <ArrowLeft size={18} className="rotate-180" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                    ) : (
                        /* DETAIL VIEW: SUB-SERVICES */
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            {itemsLoading ? (
                                // Enhanced Skeleton for items
                                [...Array(8)].map((_, i) => (
                                    <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl aspect-square shadow-sm overflow-hidden">
                                        <div className="relative h-full">
                                            {/* Image skeleton */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 animate-pulse" />
                                            {/* Content skeleton */}
                                            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                                                <div className="h-5 w-3/4 bg-white/40 rounded animate-pulse" />
                                                <div className="h-4 w-1/2 bg-white/30 rounded animate-pulse" />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : serviceItems.length > 0 ? (
                                serviceItems.map((sub, idx) => (
                                    <div
                                        key={sub._id || idx}
                                        onClick={() => handleSelectSubService(sub)}
                                        className={`group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md transition-all duration-300 aspect-square w-full cursor-pointer border-2 ${selectedItem?._id === sub._id ? 'border-blue-600 ring-4 ring-blue-600/20 scale-95' : 'border-transparent hover:shadow-xl'}`}
                                    >
                                        {/* Full Background Image */}
                                        <div className="absolute inset-0">
                                            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse" />
                                            <img
                                                src={sub.image}
                                                alt={sub.name}
                                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x400?text=No+Image'; }}
                                            />
                                            {/* Gradient Overlay */}
                                            <div className={`absolute inset-0 transition-opacity ${selectedItem?._id === sub._id ? 'bg-blue-900/40' : 'bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-80'}`} />

                                            {/* Selection Indicator */}
                                            {selectedItem?._id === sub._id && (
                                                <div className="absolute top-3 right-3 bg-blue-600 text-white p-1.5 rounded-full shadow-lg animate-in fade-in zoom-in duration-200">
                                                    <Check size={16} strokeWidth={3} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Content Overlay */}
                                        <div className="absolute bottom-0 left-0 right-0 p-4 z-20 flex flex-col justify-end h-full">
                                            <div className="transform translate-y-0 transition-transform duration-300">
                                                <h3 className="text-lg font-bold text-white mb-1 line-clamp-2 leading-tight drop-shadow-md">
                                                    {sub.name}
                                                </h3>
                                                <p className="text-sm text-gray-200 font-medium">
                                                    {sub.price}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                // Fallback if no specific sub-services
                                <div className="col-span-full text-center py-12">
                                    <p className="text-gray-500 dark:text-gray-400">{t('No specific sub-services listed.')}</p>
                                    <button
                                        onClick={() => handleRequestSubService({ name: 'General Service', price: 'TBD', description: 'Standard service request' })}
                                        className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold"
                                    >
                                        {t('Request General Service')}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                </div>

                {/* Floating Action Button for Service Request */}
                <div
                    className={`fixed bottom-32 md:bottom-8 left-0 right-0 px-6 z-[60] flex justify-center pointer-events-none`}
                >
                    <div className={`transition-all duration-500 ease-in-out transform ${viewMode === 'details' && selectedItem && !showConfirmation && !requestSuccess
                        ? 'translate-y-0 opacity-100 pointer-events-auto'
                        : 'translate-y-12 opacity-0 pointer-events-none'
                        }`}>
                        <button
                            onClick={() => selectedItem && handleRequestSubService(selectedItem)}
                            className="bg-gray-900/90 dark:bg-white/90 backdrop-blur-xl text-white dark:text-gray-900 px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 group hover:scale-105 transition-all duration-300 border border-white/10 dark:border-gray-200/50"
                        >
                            <div className="flex flex-col items-start mr-2">
                                <span className="text-[10px] uppercase tracking-wider font-bold opacity-70 leading-none mb-0.5">
                                    {t('Request Now')}
                                </span>
                                <span className="text-lg font-bold leading-none">
                                    {selectedItem ? selectedItem.name : t('Service')}
                                </span>
                            </div>
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-500 transition-colors shadow-sm">
                                <Send size={18} className="ml-0.5 text-white" />
                            </div>
                        </button>
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
                                    {t('Are you sure you want to request')} <br />
                                    <span className="font-semibold text-gray-900 dark:text-white text-base block mt-1">"{selectedService.name}"</span>
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
                                    {isSubmitting ? t('Sending...') : t('Confirm')}
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
                                    {t('Our team will contact you shortly')}
                                    {activeService?.mobile && <span> {t('at')} <span className="font-semibold text-blue-600">{activeService.mobile}</span></span>}.
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setRequestSuccess(false);
                                    setSelectedItem(null);
                                }}
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
