import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useUserProfile } from '../hooks/queries/useUsers';
import { getStoreName, calculateDeliveryCharge } from '../utils/storeHelpers';
import { ArrowLeft, MapPin, CreditCard, ShoppingBag, Truck, AlertCircle, X, Navigation, ShieldCheck, Trash2, Store, Pencil, Package, MoreHorizontal, CheckCircle } from 'lucide-react';
import { checkLocationPermission, requestLocationPermission, getCurrentLocation } from '../utils/locationHelpers';
import { AnimatePresence, motion } from 'framer-motion';

import { API_BASE_URL } from '../utils/api';

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const directPurchase = location.state?.directPurchase;
    const { cartItems, cartTotal, clearCart, removeFromCart } = useCart();
    const { user, setUser, loading: authLoading } = useAuth();
    const { data: userProfile } = useUserProfile(); // Fetch fresh user data with coins
    const { t, language } = useLanguage();
    const { stores, updateUser } = useData();
    const [formData, setFormData] = useState({
        fullName: '',
        mobile: '',
        address: '',
        city: '',
        zip: '630702', // Default Pincode
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
    const [isLocationSearching, setIsLocationSearching] = useState(false);
    const [cachedLocation, setCachedLocation] = useState(null); 
    const [locationMessage, setLocationMessage] = useState({ show: false, type: '', text: '' });

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
    const [permissionStatus, setPermissionStatus] = useState('prompt'); // granted, prompt, denied


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
                    zip: '630702', // Default if missing
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

    // Check geolocation permission status on mount and when editing starts
    useEffect(() => {
        if (isEditingAddress && navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: 'geolocation' }).then(result => {
                setPermissionStatus(result.state);
                result.onchange = () => setPermissionStatus(result.state);
            }).catch(err => console.warn('Permissions API not supported', err));
        }
    }, [isEditingAddress]);

    // Auto-hide location messages
    useEffect(() => {
        if (locationMessage.show) {
            const timer = setTimeout(() => {
                setLocationMessage(prev => ({ ...prev, show: false }));
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [locationMessage.show]);

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
        if (!formData.fullName || !formData.mobile || !formData.address || !formData.city) {
            alert(t('Please fill in all required fields'));
            return;
        }

        // Validate Location (Require GPS location)
        if (!formData.location) {
            setIsEditingAddress(true); // Open edit mode to show the location button
            setLocationMessage({ show: true, type: 'error', text: t('Please share your current location for delivery') });
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll up to show the message and location button
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

    useEffect(() => {
        if (displayItems.length === 0) {
            navigate('/cart');
        }
    }, [displayItems.length, navigate]);

    if (displayItems.length === 0) {
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
        <div className="min-h-screen bg-[#E8EAEF] dark:bg-gray-900 transition-colors duration-200 pb-20 md:pb-40 relative">
            {/* Simple Header */}
            <div className="w-full px-5 py-4">
                <div className="max-w-md mx-auto flex items-center justify-between">
                     <button onClick={() => navigate(-1)} className="w-[42px] h-[42px] flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-sm text-gray-900 dark:text-white transition-transform active:scale-95 border border-gray-100/50">
                         <ArrowLeft size={22} />
                     </button>
                     <h1 className="text-[17px] font-bold text-gray-900 dark:text-white tracking-tight">{t('Checkout')}</h1>
                     <div className="w-[42px]" /> 
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Location Toast Message - Refined for clarity */}
                {locationMessage.show && (
                    <div className={`fixed top-32 left-1/2 transform -translate-x-1/2 z-[9999] px-6 py-3 rounded-full shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-top-4 max-w-[90vw] ${
                        locationMessage.type === 'success'
                        ? 'bg-[#2E5A2E] text-white'
                        : 'bg-red-600 text-white'
                        }`}>
                        <div className="flex items-center gap-3 whitespace-nowrap">
                            {locationMessage.type === 'success' ? (
                                <ShieldCheck size={18} className="flex-shrink-0" />
                            ) : (
                                <AlertCircle size={18} className="flex-shrink-0" />
                            )}
                            <span className="font-bold text-[13px] tracking-tight">{locationMessage.text}</span>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Shipping Address */}
                        {/* Shipping Address */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-9 h-9 rounded-xl bg-green-50 dark:bg-[#CBF9B2]/10 flex items-center justify-center text-[#2E5A2E] dark:text-[#CBF9B2]">
                                    <MapPin size={18} />
                                </div>
                                <h2 className="text-[17px] font-bold text-gray-900 dark:text-white">{t('Shipping details')}</h2>
                            </div>

                            {!isInitialized || authLoading ? (
                                <div className="animate-pulse space-y-4">
                                     <div className="h-32 bg-gray-50 dark:bg-gray-700 rounded-2xl w-full"></div>
                                </div>
                            ) : !isEditingAddress ? (
                                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-600 relative group">
                                    <button 
                                        type="button"
                                        onClick={() => setIsEditingAddress(true)}
                                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-[#2E5A2E] dark:hover:text-[#CBF9B2] transition-colors"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <div className="space-y-2">
                                        <div className="flex flex-col gap-0.5">
                                            <p className="font-bold text-[16px] text-gray-900 dark:text-white">{formData.fullName || t('No Name')}</p>
                                            <p className="text-[13px] text-gray-400 font-medium">{formData.mobile}</p>
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">{formData.address}</p>
                                            <p className="text-[13px] text-gray-500 dark:text-gray-400">{formData.city} - {formData.zip}</p>
                                        </div>
                                        
                                        {formData.location && (
                                            <div className="pt-1">
                                                <div className="flex items-center gap-1.5 text-[#2E5A2E] dark:text-[#CBF9B2] text-[10px] font-bold bg-[#E8F5E9] dark:bg-[#CBF9B2]/10 px-2.5 py-1 rounded-full w-fit border border-[#2E5A2E]/10 dark:border-[#CBF9B2]/10">
                                                    <CheckCircle size={11} className="text-[#2E5A2E] dark:text-[#CBF9B2]" />
                                                    <span>{t('Location Saved')}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {/* Location Detection Block */}
                                    <div className="relative mb-6">
                                        {isLocationSearching && (
                                            <motion.div
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: [0.8, 1.2, 1.4], opacity: [0, 0.3, 0] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                                                className="absolute inset-0 bg-[#2E5A2E]/20 rounded-[2rem] z-0"
                                            />
                                        )}
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                setIsLocationSearching(true);
                                                const result = await getCurrentLocation();
                                                
                                                if (result.success) {
                                                    setFormData(prev => ({ ...prev, location: result.mapsLink }));
                                                    setIsLocationSearching(false);
                                                    setLocationMessage({ show: true, type: 'success', text: t('Location Accessed Successfully') });
                                                } else {
                                                    setIsLocationSearching(false);
                                                    setLocationMessage({ show: true, type: 'error', text: t(result.message) });
                                                }
                                            }}
                                            disabled={isLocationSearching}
                                            className={`w-full relative z-10 bg-white dark:bg-gray-800 border-2 border-dashed p-5 rounded-[2rem] flex items-center justify-between gap-3 group transition-all duration-300 active:scale-[0.98] ${
                                                isLocationSearching ? 'border-[#2E5A2E] dark:border-[#CBF9B2] bg-green-50/30 dark:bg-[#CBF9B2]/5' : 
                                                formData.location ? 'border-[#2E5A2E] dark:border-[#CBF9B2] bg-green-50/30 dark:bg-[#CBF9B2]/5' : 'border-gray-200 dark:border-gray-700'
                                            }`}
                                        >
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <div className="relative flex-shrink-0">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                                                        isLocationSearching ? 'bg-[#2E5A2E] dark:bg-[#CBF9B2] text-white dark:text-gray-900 shadow-lg shadow-green-200 scale-110' :
                                                        formData.location ? 'bg-green-100 dark:bg-[#CBF9B2]/20 text-[#2E5A2E] dark:text-[#CBF9B2]' : 'bg-gray-50 dark:bg-gray-700 text-gray-400'
                                                    }`}>
                                                        <AnimatePresence mode="wait">
                                                            {isLocationSearching ? (
                                                                <motion.div
                                                                    key="detecting"
                                                                    initial={{ rotate: 0 }}
                                                                    animate={{ rotate: 360 }}
                                                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                                >
                                                                    <Navigation size={22} />
                                                                </motion.div>
                                                            ) : (
                                                                <motion.div
                                                                    key={formData.location ? 'saved' : 'empty'}
                                                                    initial={{ scale: 0.5, opacity: 0 }}
                                                                    animate={{ scale: 1, opacity: 1 }}
                                                                    exit={{ scale: 0.5, opacity: 0 }}
                                                                >
                                                                    <MapPin size={22} className={formData.location ? 'animate-bounce' : ''} />
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                    {isLocationSearching && (
                                                        <motion.div
                                                            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                                                            transition={{ duration: 1, repeat: Infinity }}
                                                            className="absolute inset-0 rounded-full bg-[#2E5A2E]"
                                                        />
                                                    )}
                                                </div>
                                                <div className="text-left flex-1 min-w-0">
                                                    <h3 className={`font-bold text-[15px] transition-colors duration-300 truncate ${isLocationSearching || formData.location ? 'text-[#2E5A2E] dark:text-[#CBF9B2]' : 'text-gray-900 dark:text-white'}`}>
                                                        {isLocationSearching ? t('Finding location...') : formData.location ? t('Location Attached') : t('Pin exact GPS')}
                                                    </h3>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                                                        {isLocationSearching ? t('Please wait while we sync labels...') : formData.location ? t('Fast delivery with precise coordinates') : t('Tap to use current location')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`w-8 h-8 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors ${
                                                isLocationSearching || formData.location ? 'bg-white dark:bg-gray-700 border-[#2E5A2E]/20 dark:border-[#CBF9B2]/20 text-[#2E5A2E] dark:text-[#CBF9B2]' : 'border-gray-100 dark:border-gray-700 text-gray-400'
                                            }`}>
                                                 <ArrowLeft size={16} className={`transition-transform duration-300 ${isLocationSearching ? 'rotate-90' : 'rotate-180'}`} />
                                            </div>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('Full Address')}</label>
                                            <textarea
                                                name="address"
                                                required
                                                rows="3"
                                                value={formData.address}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#2E5A2E]/20 outline-none transition-all text-sm"
                                                placeholder={t('House no, Flat, Street name, Landmark')}
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('Mobile Number')}</label>
                                            <input
                                                type="tel"
                                                name="mobile"
                                                required
                                                value={formData.mobile}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#2E5A2E]/20 outline-none transition-all text-sm"
                                                placeholder={t('Enter 10-digit mobile number')}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('City')}</label>
                                            <select
                                                name="city"
                                                required
                                                value={formData.city}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-[#2E5A2E]/20 outline-none transition-all text-sm"
                                            >
                                                <option value="">{t('Select City')}</option>
                                                {cities.map((city, index) => (
                                                    <option key={index} value={city}>{city}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('ZIP Code')}</label>
                                            <input 
                                                type="text" 
                                                name="zip" 
                                                required 
                                                value="630702" 
                                                readOnly
                                                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none text-sm cursor-not-allowed text-gray-500 font-medium" 
                                                placeholder="630702"
                                            />
                                        </div>
                                    </div>

                                    <button 
                                        type="button" 
                                        onClick={() => setIsEditingAddress(false)} 
                                        className="w-full py-3.5 bg-black text-white rounded-full font-bold text-[14px] active:scale-[0.98] transition-transform"
                                    >
                                        {t('Save Shipping Details')}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Order Summary (Items List) */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                            <div className="p-5 flex items-center gap-3">
                                <div className="p-2 bg-green-50 dark:bg-[#CBF9B2]/20 rounded-lg text-[#2E5A2E] dark:text-[#2E5A2E]">
                                    <Package size={18} />
                                </div>
                                <h3 className="font-medium text-gray-900 dark:text-white text-base">{t('Total Summary')}</h3>
                            </div>

                            <div className="p-4 sm:p-6">
                                <div className="space-y-4">
                                    {displayItems.map((item, index) => (
                                        <div key={item.id || index} className="py-4 flex gap-4 first:pt-0">
                                            <div className="h-16 w-16 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 relative">
                                                <img
                                                    src={item.image || ((item._id || item.id || item.product) ? `${API_BASE_URL}/products/${item._id || item.id || item.product}/image` : "https://via.placeholder.com/150?text=No+Image")}
                                                    alt={item.adTitle || item.title || item.name}
                                                    className="h-full w-full object-cover"
                                                    loading="lazy"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100?text=No+Image'; }}
                                                />
                                                <div className="absolute top-0 left-0 flex flex-col items-start gap-0 z-10">
                                                    {(item.isGold || (item.product && item.product.isGold)) && (
                                                        <span className="bg-[#16A34A] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-br-lg shadow-sm mb-[1px]">
                                                            {t('Free Delivery')}
                                                        </span>
                                                    )}
                                                    {item.isFromAd && (
                                                        <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-br-lg shadow-sm">
                                                            {t('Special Offer')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <h4 className={`text-sm font-medium text-gray-900 dark:text-white mb-0.5 ${item.isFromAd ? '' : 'truncate'}`} title={item.adTitle || item.title || item.name}>
                                                    {(() => {
                                                        const fullTitle = t(item, 'title') || t(item, 'name') || item.adTitle || item.title || item.name;
                                                        if (language !== 'ta') return fullTitle;
                                                        
                                                        const bracketIndex = fullTitle.indexOf('(');
                                                        if (bracketIndex === -1) return fullTitle;

                                                        const part1 = fullTitle.substring(0, bracketIndex).trim();
                                                        const part2 = fullTitle.substring(bracketIndex + 1, fullTitle.length - 1).trim();
                                                        
                                                        const isPart1Tamil = /[\u0B80-\u0BFF]/.test(part1);
                                                        const isPart2Tamil = /[\u0B80-\u0BFF]/.test(part2);
                                                        
                                                        if (isPart1Tamil && !isPart2Tamil) return `${part1} (${part2})`;
                                                        if (isPart2Tamil && !isPart1Tamil) return `${part2} (${part1})`;
                                                        return fullTitle;
                                                    })()}
                                                </h4>
                                                {(item.storeId || item.storeName) && (
                                                    <p className="text-xs font-normal text-gray-500 dark:text-gray-400 truncate">
                                                        {getStoreName(item.storeId, stores) || item.storeName}
                                                    </p>
                                                )}
                                                <div className="flex items-center justify-between mt-1">
                                                    <div>
                                                        <p className="text-sm font-medium text-black dark:text-white">₹{((item.price * item.quantity) || 0).toFixed(0)}</p>
                                                        {(item.unit || item.weight) && (
                                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                                                                {item.unit || item.weight}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md text-xs font-medium text-gray-600 dark:text-gray-300">
                                                            x{item.quantity}
                                                        </div>
                                                        {!directPurchase && (
                                                            <button 
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    removeFromCart(item.id);
                                                                }}
                                                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                                title={t('Remove item')}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                                    <CreditCard size={20} />
                                </div>
                                <h2 className="text-[17px] font-bold text-gray-900 dark:text-white">{t('Payment Method')}</h2>
                            </div>

                            <div className="space-y-4">
                                <label className={`flex items-center p-4 rounded-3xl border-2 cursor-pointer transition-all ${formData.paymentMethod === 'cod' ? 'border-[#2E5A2E] dark:border-[#CBF9B2] bg-[#2E5A2E]/5 dark:bg-[#CBF9B2]/5' : 'border-gray-100 dark:border-gray-700 hover:border-gray-200'}`}>
                                    <div className="w-6 h-6 rounded-full border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center mr-4">
                                        {formData.paymentMethod === 'cod' && <div className="w-3 h-3 rounded-full bg-[#2E5A2E] dark:bg-[#CBF9B2]" />}
                                    </div>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cod"
                                        checked={formData.paymentMethod === 'cod'}
                                        onChange={handleChange}
                                        className="hidden"
                                    />
                                    <div className="flex-1">
                                        <span className="block font-bold text-[15px] text-gray-900 dark:text-white">{t('Cash on Delivery')}</span>
                                        <span className="block text-[13px] text-gray-400 dark:text-gray-500">{t('Pay when you receive your order')}</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary / Payment Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-[17px] font-bold text-gray-900 dark:text-white">{t('Total Summary')}</h2>
                                <span className="text-[13px] font-medium text-gray-400 tracking-tight">{displayItems.length} {t('items')}</span>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center">
                                    <span className="text-[14px] text-gray-400 font-medium">{t('Subtotal')}</span>
                                    <span className="text-[15px] font-bold text-gray-900 dark:text-white">₹{displayTotal.toFixed(0)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[14px] text-gray-400 font-medium">{t('Delivery')}</span>
                                    {deliveryCharge === 0 ? (
                                        <span className="text-[15px] font-bold text-[#2E5A2E] dark:text-[#CBF9B2]">FREE</span>
                                    ) : (
                                        <span className="text-[15px] font-bold text-gray-900 dark:text-white">₹{deliveryCharge.toFixed(0)}</span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-[15px] text-gray-500 font-medium">{t('Total')}</span>
                                    <span className="text-[17px] font-bold text-gray-900 dark:text-white">₹{finalTotal.toFixed(0)}</span>
                                </div>
                            </div>
    
                            <button
                                type="submit"
                                disabled={isNavigating}
                                className="w-full bg-black text-white rounded-full py-4 flex items-center justify-center font-normal text-[15px] active:scale-[0.98] transition-transform disabled:opacity-50"
                            >
                                {isNavigating ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : t('Place Order')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Checkout;
