import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useUserProfile } from '../hooks/queries/useUsers';
import { getStoreName, formatDeliveryRange, calculateDeliveryCharge } from '../utils/storeHelpers';
import { ArrowLeft, MapPin, Clock, CreditCard, ShoppingBag, Truck, AlertCircle, X, Navigation, ShieldCheck, Trash2, Store, Pencil } from 'lucide-react';
import { checkLocationPermission, requestLocationPermission } from '../utils/locationHelpers';
import { AnimatePresence, motion } from 'framer-motion';

import { API_BASE_URL } from '../utils/api';

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const directPurchase = location.state?.directPurchase;
    const { cartItems, cartTotal, clearCart, removeFromCart } = useCart();
    const { user, setUser, loading: authLoading } = useAuth();
    const { data: userProfile } = useUserProfile(); // Fetch fresh user data with coins
    const { t } = useLanguage();
    const { stores, updateUser, settings } = useData();
    const [formData, setFormData] = useState({
        fullName: '',
        mobile: '',
        address: '',
        city: '',
        zip: '630702', // Default Pincode
        deliveryTime: '',
        paymentMethod: 'cod',
        location: '' // GPS Location
    });

    const [cities, setCities] = useState([]); // State for cities
    const [loadingCities, setLoadingCities] = useState(true);

    useEffect(() => {
        // Fetch cities
        const fetchCities = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/settings/cities`);
                const data = await response.json();
                if (data.success && data.data && Array.isArray(data.data.value)) {
                    setCities(data.data.value);
                }
            } catch (error) {
                console.error('Error fetching cities:', error);
            } finally {
                setLoadingCities(false);
            }
        };
        fetchCities();
    }, []);
    const [isNavigating, setIsNavigating] = useState(false);
    const [cachedLocation, setCachedLocation] = useState(null); // Store pre-fetched location for instant access
    const [locationMessage, setLocationMessage] = useState({ show: false, type: '', text: '' }); // For location feedback

    // PRE-FETCH LOCATION DISABLED - Causes crashes when permission dialog appears
    // User must manually click "Use Current Location" button
    // useEffect(() => {
    //     const preFetchLocation = async () => {
    //         // DISABLED - This was causing crashes when entering the page
    //     };
    //     preFetchLocation();
    // }, []);
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isDeliveryTimeOpen, setIsDeliveryTimeOpen] = useState(false);


    // Check if user is authenticated
    useEffect(() => {
        if (!user) {
            // Store the current path to redirect back after login
            sessionStorage.setItem('redirectAfterLogin', '/checkout');
            alert(t('Please sign in to continue with checkout'));
            navigate('/login');
        }
    }, [user, navigate, t]);

    // Autofill form with user's saved address data
    // Priority: fullName > name (to use updated profile name instead of signup username)
    // Initialize address state once user data is ready
    useEffect(() => {
        if (!authLoading) {
            if (user) {
                const addressObj = user.address || {};
                const isAddressObject = typeof user.address === 'object' && user.address !== null;

                // Check if we have valid address data to show card view
                // We check for minimal requirement: street address + city
                const hasValidAddress = (isAddressObject && addressObj.street && addressObj.city) ||
                    (!isAddressObject && user.address && user.city);

                setFormData(prev => ({
                    ...prev,
                    fullName: user.fullName || user.name || prev.fullName,
                    mobile: user.mobile || user.phone || prev.mobile,
                    // If user.address is an object, use .street, otherwise use it directly if string
                    address: (isAddressObject ? addressObj.street : user.address) || prev.address,
                    city: (isAddressObject ? addressObj.city : user.city) || prev.city,
                    zip: (isAddressObject ? addressObj.zip : (user.zip || user.pincode)) || '630702', // Default if missing
                    location: user.location || prev.location // Auto-fill saved location from profile
                }));

                // Auto-switch to card view if address exists
                if (hasValidAddress) {
                    setIsEditingAddress(false);
                } else {
                    // No valid address, show form
                    setIsEditingAddress(true);
                }

                // Always start in edit mode to allow user to review/edit -- REMOVED forced true
                // setIsEditingAddress(true);
            } else {
                // No user, defaults to true (though we redirect)
                setIsEditingAddress(true);
            }
            setIsInitialized(true);
        }
    }, [user, authLoading]);

    // If no user, don't render the form (will redirect)
    if (!user) {
        return null;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Validation logic for specific fields
        if (name === 'mobile') {
            // Only allow numbers and max 10 digits
            if (/^\d*$/.test(value) && value.length <= 10) {
                setFormData({ ...formData, [name]: value });
            }
        } else if (name === 'zip') {
            // Only allow numbers and max 6 digits
            if (/^\d*$/.test(value) && value.length <= 6) {
                setFormData({ ...formData, [name]: value });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.fullName || !formData.mobile || !formData.address || !formData.city || !formData.deliveryTime) {
            alert(t('Please fill in all required fields'));
            return;
        }

        // Validate Mobile Number (10 digits)
        if (!/^\d{10}$/.test(formData.mobile)) {
            alert(t('Please enter a valid 10-digit mobile number'));
            return;
        }

        // Validate Zip Code
        if (!/^\d{6}$/.test(formData.zip)) {
            alert(t('Please enter a valid 6-digit Pincode'));
            return;
        }

        // Validate delivery time is selected
        if (!formData.deliveryTime) {
            alert(t('Please select a preferred delivery time'));
            return;
        }

        // Show loading state for instant feedback
        setIsNavigating(true);

        // Save updated address to user profile in background (non-blocking)
        const updatedUserData = {
            ...user,
            name: formData.fullName,
            fullName: formData.fullName,
            mobile: formData.mobile,
            phone: formData.mobile,
            // Construct proper address object for backend schema
            address: {
                street: formData.address,
                city: formData.city,
                zip: formData.zip,
                state: '', // We don't have state input yet
                country: 'India'
            },
            // Keep flat fields if legacy/other parts use them, but backend prefers nested
            city: formData.city,
            zip: formData.zip,
            pincode: formData.zip
        };

        // Update localStorage immediately for instant availability
        localStorage.setItem('userInfo', JSON.stringify(updatedUserData));

        // Update AuthContext state immediately so autofill uses new data
        setUser(updatedUserData);

        // Update database in background (don't await to avoid delay)
        updateUser(updatedUserData)
            .then(() => console.log('✅ User address updated successfully'))
            .catch(error => console.error('❌ Failed to update user address:', error));

        // Navigate immediately without waiting for API call
        const currentUser = userProfile?.data || user;
        const hasCoins = currentUser?.coins > 0;
        const hasGoldProduct = displayItems.some(item => item.isGold);
        const baseDeliveryCharge = calculateDeliveryCharge(displayItems);
        const finalDeliveryCharge = (hasCoins || hasGoldProduct) ? 0 : baseDeliveryCharge;

        navigate('/order-confirmation', {
            state: {
                formData: {
                    ...formData,
                    name: formData.fullName,
                    pincode: formData.zip,
                    location: formData.location
                },
                cartItems: displayItems,
                cartTotal: displayTotal,
                deliveryCharge: finalDeliveryCharge,
                isDirectPurchase: !!directPurchase
            }
        });
    };

    // Determine items to show (Direct Purchase or Cart)
    const displayItems = directPurchase ? directPurchase.items : cartItems;
    const displayTotal = directPurchase ? directPurchase.total : cartTotal;

    if (displayItems.length === 0) {
        navigate('/cart');
        return null;
    }

    // Use userProfile for fresh coin data, fallback to user from auth
    const currentUser = userProfile?.data || user;
    const hasCoins = currentUser?.coins > 0;
    const hasGoldProduct = displayItems.some(item => item.isGold || (item.product && item.product.isGold)) || location.state?.hasGoldProduct;
    const baseDeliveryCharge = calculateDeliveryCharge(displayItems);
    const deliveryCharge = (hasCoins || hasGoldProduct) ? 0 : baseDeliveryCharge;
    const finalTotal = displayTotal + deliveryCharge;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 pb-24 transition-colors duration-200">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors flex-shrink-0"
                    >
                        <ArrowLeft className="text-gray-900 dark:text-white" size={24} />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <ShieldCheck className="text-blue-600 dark:text-blue-400" />
                        {t('Checkout')}
                    </h1>
                </div>

                {/* Location Toast Message */}
                {locationMessage.show && (
                    <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-[60] px-4 py-2 rounded-lg shadow-lg transition-all duration-300 max-w-[90vw] ${locationMessage.type === 'success'
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                        }`}>
                        <div className="flex items-center gap-2 whitespace-nowrap">
                            {locationMessage.type === 'success' ? (
                                <ShieldCheck size={16} className="flex-shrink-0" />
                            ) : (
                                <AlertCircle size={16} className="flex-shrink-0" />
                            )}
                            <span className="font-medium text-sm truncate">{locationMessage.text}</span>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Shipping Address */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <MapPin className="text-blue-600 dark:text-blue-400" size={24} />
                                {t('Shipping Details')}
                            </h2>

                            {!isInitialized || authLoading ? (
                                // Skeleton Loading State
                                <div className="animate-pulse space-y-4">
                                    <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl w-full"></div>
                                    <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl w-full"></div>
                                </div>
                            ) : !isEditingAddress ? (
                                // Address Card View
                                <div className="relative overflow-hidden bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-gray-800/50 rounded-2xl p-6 border border-blue-100 dark:border-gray-700 shadow-sm group transition-all hover:shadow-md hover:border-blue-200 dark:hover:border-gray-600">
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500 rounded-l-2xl"></div>
                                    <button
                                        type="button"
                                        onClick={() => setIsEditingAddress(true)}
                                        className="absolute top-4 right-4 p-2.5 text-blue-600 dark:text-blue-400 hover:bg-white dark:hover:bg-gray-700 rounded-full shadow-sm transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:scale-110"
                                        title={t('Edit Address')}
                                    >
                                        <Pencil size={18} />
                                    </button>

                                    <div className="flex items-start gap-4 pr-12">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">{formData.fullName}</h3>
                                            <div className="space-y-1.5">
                                                <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">
                                                    {formData.address}
                                                </p>
                                                <p className="text-gray-700 dark:text-gray-200 text-sm font-medium">
                                                    {formData.city} - {formData.zip}
                                                </p>
                                                <p className="text-gray-600 dark:text-gray-300 text-sm mt-2 flex items-center gap-1.5">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                                    <span>{formData.mobile}</span>
                                                </p>
                                                {formData.deliveryTime && (
                                                    <p className="text-gray-600 dark:text-gray-300 text-sm flex items-center gap-1.5">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                                        <span>
                                                            {formatDeliveryRange(formData.deliveryTime)}
                                                        </span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-6">
                                    {/* NEW: Prominent Location Action Card - Simplified as Rectangle */}
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            console.log('📍 Location button clicked');
                                            setIsNavigating(true);

                                            try {
                                                // Always use browser's navigator.geolocation (works in Android WebView too)
                                                console.log('📍 Using browser geolocation API...');

                                                if (!navigator.geolocation) {
                                                    console.error('📍 Geolocation not supported');
                                                    setIsNavigating(false);
                                                    setLocationMessage({ show: true, type: 'error', text: t('Location not supported on this device.') });
                                                    setTimeout(() => setLocationMessage({ show: false, type: '', text: '' }), 4000);
                                                    return;
                                                }

                                                const position = await new Promise((resolve, reject) => {
                                                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                                                        enableHighAccuracy: false,  // Faster, uses network location instead of GPS
                                                        timeout: 8000,              // Reduced from 15s to 8s
                                                        maximumAge: 300000          // Accept cached position up to 5 minutes old
                                                    });
                                                });

                                                console.log('📍 Position received:', position);

                                                if (!position || !position.coords) {
                                                    console.error('📍 No position data');
                                                    setIsNavigating(false);
                                                    setLocationMessage({ show: true, type: 'error', text: t('Unable to retrieve location data.') });
                                                    setTimeout(() => setLocationMessage({ show: false, type: '', text: '' }), 4000);
                                                    return;
                                                }

                                                const { latitude, longitude } = position.coords;
                                                console.log('📍 Coordinates:', latitude, longitude);

                                                const mapsLink = `https://maps.google.com/maps?q=${latitude},${longitude}`;
                                                console.log('📍 Maps link:', mapsLink);

                                                try {
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        location: mapsLink
                                                    }));
                                                    console.log('📍 Form data updated');
                                                } catch (formError) {
                                                    console.error('📍 Form update error:', formError);
                                                }

                                                if (user) {
                                                    try {
                                                        const updatedUserData = {
                                                            ...user,
                                                            location: mapsLink
                                                        };
                                                        setUser(updatedUserData);
                                                        localStorage.setItem('userInfo', JSON.stringify(updatedUserData));
                                                        console.log('📍 User data updated');

                                                        updateUser(updatedUserData)
                                                            .then(() => console.log('📍 Database updated'))
                                                            .catch(err => console.error('📍 Database error:', err));
                                                    } catch (userError) {
                                                        console.error('📍 User update error:', userError);
                                                    }
                                                }

                                                console.log('📍 Location update complete');
                                                setIsNavigating(false);

                                                // Show success message
                                                setLocationMessage({ show: true, type: 'success', text: t('Location accessed successfully!') });
                                                setTimeout(() => setLocationMessage({ show: false, type: '', text: '' }), 3000);
                                            } catch (error) {
                                                console.error('📍 Error:', error);
                                                setIsNavigating(false);

                                                // Handle specific error codes with actionable messages
                                                if (error.code === 1) {
                                                    // Permission denied
                                                    setLocationMessage({
                                                        show: true,
                                                        type: 'error',
                                                        text: t('Please allow location access in browser settings')
                                                    });
                                                } else if (error.code === 2) {
                                                    // Position unavailable - GPS is off
                                                    setLocationMessage({
                                                        show: true,
                                                        type: 'error',
                                                        text: t('Please turn on GPS/Location in your device settings')
                                                    });
                                                } else if (error.code === 3) {
                                                    // Timeout - usually means GPS is off or weak signal
                                                    setLocationMessage({
                                                        show: true,
                                                        type: 'error',
                                                        text: t('Please turn on GPS/Location in your device settings')
                                                    });
                                                } else {
                                                    setLocationMessage({
                                                        show: true,
                                                        type: 'error',
                                                        text: t('Unable to get location. Check GPS settings')
                                                    });
                                                }
                                                setTimeout(() => setLocationMessage({ show: false, type: '', text: '' }), 5000);
                                            }
                                        }}
                                        disabled={isNavigating}
                                        className="w-full bg-blue-600 text-white p-4 rounded-xl shadow-md shadow-blue-500/10 hover:bg-blue-700 transition-all duration-300 text-left flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
                                                {isNavigating ? (
                                                    <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <MapPin className="text-white w-5 h-5" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-sm md:text-base">
                                                    {isNavigating ? t('Detecting Location...') : t('Use Current Location')}
                                                </h3>
                                                <p className="text-blue-100/80 text-xs mt-0.5">
                                                    {t('Tap to autofill address details')}
                                                </p>
                                            </div>
                                        </div>
                                        <ArrowLeft className="text-white/60 rotate-180" size={20} />
                                    </button>

                                    {/* Saved GPS Indicator */}
                                    {formData.location && !isNavigating && (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl animate-fade-in">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                                                {t('Saved GPS Location Attached')}
                                            </span>
                                            <button 
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, location: '' }))}
                                                className="ml-auto text-blue-400 hover:text-red-500 transition-colors"
                                                title={t('Clear Location')}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    )}

                                    {/* Separator */}
                                    <div className="flex items-center gap-4">
                                        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('OR ENTER MANUALLY')}</span>
                                        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700"></div>
                                    </div>

                                    {/* Edit Address Form Container - Matches View Card Style */}
                                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Full Name')}</label>
                                                <input
                                                    type="text"
                                                    name="fullName"
                                                    required
                                                    value={formData.fullName}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                                                    placeholder={t('Enter your full name')}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Mobile Number')}</label>
                                                <input
                                                    type="tel"
                                                    name="mobile"
                                                    required
                                                    value={formData.mobile}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                                                    placeholder={t('Enter your mobile number')}
                                                    maxLength={10}
                                                    inputMode="numeric"
                                                    pattern="\d{10}"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('Address')}</label>
                                                {/* <button
                                                    type="button"
                                                    onClick={() => {
                                                        // Always try to fetch fresh location when clicked
                                                        if (!navigator.geolocation) {
                                                            alert(t('Geolocation is not supported by your browser'));
                                                            return;
                                                        }

                                                        navigator.geolocation.getCurrentPosition(
                                                            (position) => {
                                                                const { latitude, longitude } = position.coords;
                                                                // Update cache for next time
                                                                setCachedLocation({ latitude, longitude });

                                                                // Store as Google Maps URL for consistency
                                                                const mapsLink = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    location: mapsLink
                                                                }));

                                                                // Update User Location in Background Immediately
                                                                if (user) {
                                                                    const updatedUserData = {
                                                                        ...user,
                                                                        location: mapsLink
                                                                    };

                                                                    // Optimistic update
                                                                    setUser(updatedUserData);
                                                                    localStorage.setItem('userInfo', JSON.stringify(updatedUserData));

                                                                    updateUser(updatedUserData)
                                                                        .then(() => console.log('📍 Location updated in database'))
                                                                        .catch(err => console.error('Failed to update location:', err));
                                                                }
                                                            },
                                                                console.error("Error fetching location:", error);
                                                                
                                                                // Handle Timeout specifically with a Retry option
                                                                if (error.code === 3) {
                                                                    if (confirm(t('Location request timed out. Would you like to try again outside?'))) {
                                                                        // Retry with longer timeout and high accuracy
                                                                        navigator.geolocation.getCurrentPosition(
                                                                            (position) => {
                                                                                const { latitude, longitude } = position.coords;
                                                                                setCachedLocation({ latitude, longitude });
                                                                                const mapsLink = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
                                                                                setFormData(prev => ({ ...prev, location: mapsLink }));
                                                                                if (user) {
                                                                                    const updatedUserData = { ...user, location: mapsLink };
                                                                                    setUser(updatedUserData);
                                                                                    localStorage.setItem('userInfo', JSON.stringify(updatedUserData));
                                                                                    updateUser(updatedUserData).catch(err => console.error('Failed to update location:', err));
                                                                                }
                                                                            },
                                                                            (retryError) => {
                                                                                alert(t('Still unable to retrieve location. Please check your GPS settings.'));
                                                                            },
                                                                            { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
                                                                        );
                                                                        return;
                                                                    }
                                                                }

                                                                let errorMessage = t('Unable to retrieve your location. Please check if your device location is on.');
                                                                if (error.code === 1) errorMessage = t('Location permission denied. Please enable location access in your browser settings.');
                                                                else if (error.code === 2) errorMessage = t('Location unavailable. Please check if your device location/GPS is turned on.');
                                                                
                                                                alert(errorMessage);
                                                            },
                                                            {
                                                                enableHighAccuracy: true,
                                                                timeout: 15000,
                                                                maximumAge: 0 // Force fresh location
                                                            }
                                                        );
                                                    }}
                                                    className="text-xs flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-medium bg-blue-50 dark:bg-gray-700 px-2 py-1 rounded-lg border border-blue-100 dark:border-gray-600"
                                                >
                                                    <MapPin size={12} />
                                                    {t('📍 Use Current Location')}
                                            </button> */}
                                                <textarea
                                                    name="address"
                                                    required
                                                    rows="3"
                                                    value={formData.address}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-colors resize-none"
                                                    placeholder={t('Enter your full address')}
                                                />
                                            </div>
                                            {/* City Dropdown & Zip Code */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        {t('City')} <span className="text-red-500">*</span>
                                                    </label>
                                                    {loadingCities ? (
                                                        <div className="animate-pulse h-12 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                                                    ) : (
                                                        <select
                                                            name="city"
                                                            required
                                                            value={formData.city}
                                                            onChange={handleChange}
                                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-colors appearance-none"
                                                        >
                                                            <option value="">{t('Select City')}</option>
                                                            {cities.map((city, index) => (
                                                                <option key={index} value={city}>{city}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        {t('Pincode')} <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="zip"
                                                        required
                                                        value={formData.zip}
                                                        onChange={handleChange}
                                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                                                        placeholder={t('630702')}
                                                        maxLength={6}
                                                        inputMode="numeric"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Delivery Time - Custom Dropdown */}
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    {t('Preferred Delivery Time')} <span className="text-red-500">*</span>
                                </label>
                                {(() => {
                                    const now = new Date();
                                    // Strict timing: only show slot if current time is BEFORE or EXACTLY at slot start
                                    const threshold = now;
                                    // 3-hour window: only show slots within the next 3 hours
                                    const windowEnd = new Date(now.getTime() + 3 * 60 * 60000);

                                    // Only use slots that admin has enabled in Settings
                                    const allowedSlots = settings?.deliveryTimes || [];
                                    const availableSlots = [];

                                    allowedSlots.forEach(timeValue => {
                                        const [hours, mins] = timeValue.split(':').map(Number);
                                        const displayTime = formatDeliveryRange(timeValue);

                                        // 1. Add for TODAY if still available
                                        const slotDateToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, mins);
                                        if (slotDateToday >= threshold) {
                                            availableSlots.push({
                                                value: `today|${timeValue}`,
                                                label: displayTime,
                                                period: 'today',
                                                timeValue
                                            });
                                        }

                                        // 2. Add for TOMORROW
                                        availableSlots.push({
                                            value: `tomorrow|${timeValue}`,
                                            label: displayTime,
                                            period: 'tomorrow',
                                            timeValue
                                        });
                                    });

                                    // Sort by period then time
                                    availableSlots.sort((a, b) => {
                                        if (a.period !== b.period) return a.period === 'today' ? -1 : 1;
                                        return a.timeValue.localeCompare(b.timeValue);
                                    });

                                    const displaySlots = availableSlots.slice(0, 2); 
                                    const selectedSlot = displaySlots.find(s => s.value === formData.deliveryTime);

                                    return (
                                        <div className="relative">
                                            {/* Dropdown Trigger */}
                                            <button
                                                type="button"
                                                onClick={() => setIsDeliveryTimeOpen(!isDeliveryTimeOpen)}
                                                className={`w-full relative overflow-hidden rounded-2xl border transition-all duration-300 group ${formData.deliveryTime
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-700'
                                                    }`}
                                            >
                                                <div className="p-4 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2.5 rounded-xl transition-colors ${formData.deliveryTime ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                                                            <Clock size={20} className={formData.deliveryTime ? 'animate-pulse' : ''} />
                                                        </div>
                                                        <div className="text-left">
                                                            <p className={`text-xs font-bold uppercase tracking-wider mb-0.5 ${formData.deliveryTime ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>
                                                                {formData.deliveryTime ? t('Selected Time') : t('Select Time')}
                                                            </p>
                                                            <h3 className={`font-bold text-base sm:text-lg ${formData.deliveryTime ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                                                                {selectedSlot ? selectedSlot.label : t('Tap to choose a slot')}
                                                            </h3>
                                                        </div>
                                                    </div>
                                                    <div className={`transform transition-transform duration-300 ${isDeliveryTimeOpen ? 'rotate-180' : ''}`}>
                                                        <div className="bg-white dark:bg-gray-700 rounded-full p-1.5 border border-gray-100 dark:border-gray-600">
                                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-gray-500">
                                                                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Progress Bar / Decorator */}
                                                {formData.deliveryTime && (
                                                    <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 w-full" />
                                                )}
                                            </button>

                                            {/* Dropdown Content */}
                                            <AnimatePresence>
                                                {isDeliveryTimeOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                                        className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden max-h-80 overflow-y-auto scrollbar-hide ring-1 ring-black/5"
                                                    >
                                                        <div className="p-2 space-y-2">
                                                            {displaySlots.length === 0 ? (
                                                                <div className="p-8 text-center text-gray-500">
                                                                    <div className="bg-gray-50 dark:bg-gray-700/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                                                        <Clock size={24} className="opacity-50" />
                                                                    </div>
                                                                    <p>{t('No slots available')}</p>
                                                                </div>
                                                            ) : (
                                                                <div className="p-3">
                                                                    {displaySlots.length === 0 ? (
                                                                        <div className="p-8 text-center text-gray-500">
                                                                            <div className="bg-gray-50 dark:bg-gray-700/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                                                                <Clock size={24} className="opacity-50" />
                                                                            </div>
                                                                            <p>{t('No slots available')}</p>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                                            {displaySlots.map((slot) => (
                                                                                <button
                                                                                    key={slot.value}
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        setFormData({ ...formData, deliveryTime: slot.value });
                                                                                        setIsDeliveryTimeOpen(false);
                                                                                    }}
                                                                                    className={`py-3 px-2 rounded-xl text-[11px] sm:text-sm font-medium whitespace-nowrap transition-all duration-200 border ${formData.deliveryTime === slot.value
                                                                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200 dark:shadow-blue-900/20 scale-[0.98]'
                                                                                        : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 border-transparent hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-gray-200 dark:hover:border-gray-500'
                                                                                        }`}
                                                                                >
                                                                                    {slot.label}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {/* Instructions - Only show when closed/empty */}
                                            {!formData.deliveryTime && !isDeliveryTimeOpen && (
                                                <p className="mt-2 text-xs text-center text-gray-400 animate-pulse">
                                                    {t('Tap the box above to see available times')}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })()} 
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <CreditCard className="text-blue-600 dark:text-blue-400" size={24} />
                                {t('Payment Method')}
                            </h2>
                            <div className="space-y-4">
                                <label className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'}`}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cod"
                                        checked={formData.paymentMethod === 'cod'}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                                    />
                                    <div className="ml-4">
                                        <span className="block font-medium text-gray-900 dark:text-white">{t('Cash on Delivery')}</span>
                                        <span className="block text-sm text-gray-500 dark:text-gray-400">{t('Pay when you receive your order')}</span>
                                    </div>
                                    <Truck className="ml-auto text-gray-400" size={24} />
                                </label>


                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('Order Summary')}</h2>

                            <div className="space-y-4 mb-6">
                                {displayItems.map((item) => (
                                    <div key={item.id} className="flex gap-4 group">
                                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 relative">
                                            <img
                                                src={item.image || `${API_BASE_URL}/products/${item._id || item.id}/image`}
                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100?text=No+Image'; }}
                                                alt={item.adTitle || item.title}
                                                className="h-full w-full object-cover object-center"
                                            />
                                            {/* Status Tags */}
                                            <div className="absolute top-0 left-0 flex flex-col items-start gap-0 z-10">
                                                {item.isGold && (
                                                    <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-br-lg shadow-sm mb-[1px]">
                                                        Free
                                                    </span>
                                                )}
                                                {item.isFromAd && (
                                                    <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-br-lg shadow-sm">
                                                        Offer
                                                    </span>
                                                )}
                                            </div>
                                            {(() => {
                                                const unitText = item.unit;
                                                if (!unitText) return null;
                                                return (
                                                    <div className="absolute bottom-0 right-0 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-tl-xl rounded-br-[11px] z-10 pointer-events-none shadow-[0_-2px_4px_rgba(0,0,0,0.05)] border-t border-l border-white/50">
                                                        <span className="text-[10px] font-extrabold tracking-tight text-gray-900 leading-none block">
                                                            {unitText}
                                                        </span>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                        <div className="flex flex-1 flex-col justify-center min-w-0">
                                            {(() => {
                                                // Use adTitle if available, otherwise use regular title
                                                const displayTitle = item.adTitle || item.title || item.name || t('Product');
                                                const fullTitle = t(item, 'title') || displayTitle;
                                                // Use line-clamp-2 for ads to show full title, truncate for regular items
                                                const titleClass = item.isFromAd ? 'line-clamp-2' : 'truncate';

                                                // For special offers, show full title without bracket splitting
                                                if (item.isFromAd) {
                                                    return <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1 leading-normal" title={fullTitle}>{fullTitle}</h3>;
                                                }

                                                // For regular items, apply bracket splitting logic
                                                const bracketMatch = fullTitle.match(/[(（\[{]/);
                                                const bracketIndex = bracketMatch ? bracketMatch.index : -1;

                                                if (bracketIndex !== -1) {
                                                    const mainTitle = fullTitle.substring(0, bracketIndex).trim();
                                                    const bracketText = fullTitle.substring(bracketIndex).trim();
                                                    return (
                                                        <div>
                                                            <h3 className={`text-sm font-medium text-gray-900 dark:text-white ${titleClass}`} title={mainTitle}>{mainTitle}</h3>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5" title={bracketText}>{bracketText}</p>
                                                        </div>
                                                    );
                                                }
                                                return <h3 className={`text-sm font-medium text-gray-900 dark:text-white ${titleClass}`} title={fullTitle}>{fullTitle}</h3>;
                                            })()}
                                            {(item.storeId || item.storeName) && (
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <Store size={10} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                        {getStoreName(item.storeId, stores) || item.storeName}
                                                    </p>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1.5">
                                                <div className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-medium text-gray-600 dark:text-gray-300">
                                                    {item.quantity}
                                                </div>
                                            </div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">₹{(item.price * item.quantity).toFixed(0)}</p>
                                        </div>
                                        {/* Only show remove button if NOT a direct purchase */}
                                        {!directPurchase && (
                                            <button
                                                type="button"
                                                onClick={() => removeFromCart(item.id)}
                                                className="self-center p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                                                aria-label={t('Remove item')}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">{t('Subtotal')}</span>
                                    <span className="font-medium text-gray-900 dark:text-white">₹{displayTotal.toFixed(0)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">{t('Delivery Charge')}</span>
                                    {(hasCoins || hasGoldProduct) ? (
                                        <div className="text-right">
                                            <span className="font-medium text-green-600 dark:text-green-400">FREE</span>
                                            {hasGoldProduct ? (
                                                <p className="text-xs text-emerald-600 dark:text-emerald-500 flex items-center justify-end gap-1 font-bold">
                                                    Free Delivery
                                                </p>
                                            ) : (
                                                <p className="text-xs text-yellow-600 dark:text-yellow-500 flex items-center justify-end gap-1">
                                                    <span>🪙</span> Coin Applied
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="font-medium text-gray-900 dark:text-white">₹20</span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between text-base font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-900 dark:text-white">{t('Total')}</span>
                                    <span className="text-blue-600 dark:text-blue-400">₹{finalTotal.toFixed(0)}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={isNavigating}
                                className="hidden md:flex w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg items-center justify-center gap-2 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {isNavigating ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        {t('Loading...')}
                                    </>
                                ) : (
                                    <>
                                        <ShoppingBag size={22} />
                                        {t('Review Order')}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div >

            {/* Sticky Action Footer - Mobile Only - Redesigned */}
            < div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-50 md:hidden pb-[calc(0.75rem+env(safe-area-inset-bottom))] px-4 py-3" >
                <div className="max-w-7xl mx-auto flex items-center gap-4">
                    <div className="flex flex-col flex-shrink-0">
                        <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider mb-0.5">{t('Total Amount')}</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">₹{finalTotal.toFixed(0)}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isNavigating}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 px-4 text-base rounded-2xl shadow-lg shadow-blue-200 dark:shadow-blue-900/20 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-70 disabled:grayscale"
                    >
                        {isNavigating ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            </>
                        ) : (
                            <>
                                <span>{t('Review Order')}</span>
                                <ShoppingBag size={20} className="ml-1" />
                            </>
                        )}
                    </button>
                </div>
            </div >
        </div >
    );
};

export default Checkout;
