import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useUserProfile } from '../hooks/queries/useUsers';
import { getStoreName } from '../utils/storeHelpers';
import { CreditCard, Truck, MapPin, ShieldCheck, ShoppingBag, ArrowLeft, Store, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../utils/api';

const Checkout = () => {
    const navigate = useNavigate();
    const { cartItems, cartTotal, clearCart, removeFromCart } = useCart();
    const { user, setUser } = useAuth();
    const { data: userProfile } = useUserProfile(); // Fetch fresh user data with coins
    const { t } = useLanguage();
    const { stores, updateUser, settings } = useData();
    const [formData, setFormData] = useState({
        fullName: '',
        mobile: '',
        address: '',
        city: '',
        zip: '',
        deliveryTime: '',
        paymentMethod: 'cod',
        location: '' // Maps link
    });
    const [isNavigating, setIsNavigating] = useState(false);
    const [cachedLocation, setCachedLocation] = useState(null); // Store pre-fetched location for instant access

    // Check if user is authenticated
    useEffect(() => {
        if (!user) {
            // Store the current path to redirect back after login
            sessionStorage.setItem('redirectAfterLogin', '/checkout');
            alert(t('Please sign in to continue with checkout'));
            navigate('/login');
        }
    }, [user, navigate, t]);

    // PRE-FETCH LOCATION ON MOUNT (Silent)
    // This warms up the browser's location cache so the click is instant
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Success - Store for later use
                    setCachedLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                    console.log('📍 Location pre-fetched and cached');
                },
                (error) => {
                    console.log('📍 Location pre-fetch failed (silent):', error.message);
                },
                {
                    enableHighAccuracy: false, // Network based (faster)
                    timeout: 10000,
                    maximumAge: Infinity // Accept any cached location
                }
            );
        }
    }, []);

    // Autofill form with user's saved address data
    // Priority: fullName > name (to use updated profile name instead of signup username)
    useEffect(() => {
        if (user) {
            // Handle both flat structure (legacy) and nested schema structure
            const addressObj = user.address || {};
            const isAddressObject = typeof user.address === 'object' && user.address !== null;

            setFormData(prev => ({
                ...prev,
                fullName: user.fullName || user.name || prev.fullName,
                mobile: user.mobile || user.phone || prev.mobile,
                // If user.address is an object, use .street, otherwise use it directly if string
                address: (isAddressObject ? addressObj.street : user.address) || prev.address,
                city: (isAddressObject ? addressObj.city : user.city) || prev.city,
                zip: (isAddressObject ? addressObj.zip : (user.zip || user.pincode)) || prev.zip,
                location: user.location || prev.location // Auto-fill saved location from profile
            }));
        }
    }, [user]);

    // If no user, don't render the form (will redirect)
    if (!user) {
        return null;
    }

    const handleLocation = () => {
        // INSTANT RESPONSE: Check if we already have it cached
        if (cachedLocation) {
            const mapsLink = `https://maps.google.com/maps?q=${cachedLocation.latitude},${cachedLocation.longitude}`;
            setFormData(prev => ({ ...prev, location: mapsLink }));
            alert(t('Location retrieved successfully!')); // Show success immediately
            return;
        }

        setIsNavigating(true); // Re-use loading state
        if (!navigator.geolocation) {
            alert(t('Geolocation is not supported by your browser'));
            setIsNavigating(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                // Update cache for next time
                setCachedLocation({ latitude, longitude });

                const mapsLink = `https://maps.google.com/maps?q=${latitude},${longitude}`;
                setFormData(prev => ({ ...prev, location: mapsLink }));
                setIsNavigating(false);
                alert(t('Location retrieved successfully!'));
            },
            (error) => {
                console.error('Error getting location:', error);
                let errorMessage = t('Unable to retrieve your location. Please check if your device location is on.');

                // Provide specific error messages
                if (error.code === 1) { // PERMISSION_DENIED
                    errorMessage = t('Location permission denied. Please enable location access in your browser settings.');
                } else if (error.code === 2) { // POSITION_UNAVAILABLE
                    errorMessage = t('Location unavailable. Please check if your device location/GPS is turned on.');
                } else if (error.code === 3) { // TIMEOUT
                    errorMessage = t('Location request timed out. Please check if your device location/GPS is turned on.');
                }

                alert(errorMessage);
                setIsNavigating(false);
            },
            {
                enableHighAccuracy: false,
                timeout: 15000,
                maximumAge: Infinity // Accept ANY cached location for speed
            }
        );
    };

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
        if (!formData.fullName || !formData.address || !formData.city || !formData.zip) {
            alert(t('Please fill in all required fields'));
            return;
        }

        const mobileRegex = /^\d{10}$/;
        const zipRegex = /^\d{6}$/;

        if (!mobileRegex.test(formData.mobile)) {
            alert(t('Please enter a valid 10-digit mobile number'));
            return;
        }

        if (!zipRegex.test(formData.zip)) {
            alert(t('Please enter a valid 6-digit ZIP code'));
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
        const finalDeliveryCharge = hasCoins ? 0 : 20;

        navigate('/order-confirmation', {
            state: {
                formData: {
                    ...formData,
                    name: formData.fullName,
                    pincode: formData.zip
                },
                cartItems,
                cartTotal,
                deliveryCharge: finalDeliveryCharge
            }
        });
    };

    if (cartItems.length === 0) {
        navigate('/cart');
        return null;
    }

    // Use userProfile for fresh coin data, fallback to user from auth
    const currentUser = userProfile?.data || user;
    const hasCoins = currentUser?.coins > 0;
    const deliveryCharge = hasCoins ? 0 : 20;
    const finalTotal = cartTotal + deliveryCharge;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 pb-24 transition-colors duration-200">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => navigate('/cart')}
                    className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-8 transition-colors group"
                >
                    <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={20} />
                    <span className="font-medium">{t('Back to Cart')}</span>
                </button>

                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-8 flex items-center gap-3">
                    <ShieldCheck className="text-blue-600 dark:text-blue-400" />
                    {t('Checkout')}
                </h1>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Shipping Address */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
                            <h2 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6 flex items-center gap-2">
                                <MapPin className="text-blue-600 dark:text-blue-400" size={24} />
                                {t('Shipping Details')}
                            </h2>
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
                                    <textarea
                                        name="address"
                                        required
                                        rows="3"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-colors resize-none mb-2"
                                        placeholder={t('Enter your full address')}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleLocation}
                                        disabled={isNavigating}
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 font-medium transition-colors"
                                    >
                                        <MapPin size={16} />
                                        {formData.location ? t('Location Saved ✅') : t('Use Current Location')}
                                    </button>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('City')}</label>
                                    <input
                                        type="text"
                                        name="city"
                                        required
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                                        placeholder={t('Enter city')}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('ZIP Code')}</label>
                                    <input
                                        type="text"
                                        name="zip"
                                        required
                                        value={formData.zip}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                                        placeholder={t('Enter ZIP code')}
                                        maxLength={6}
                                        inputMode="numeric"
                                        pattern="\d{6}"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        {t('Preferred Delivery Time')} <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="deliveryTime"
                                        required
                                        value={formData.deliveryTime}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                                    >
                                        <option value="">{t('Select a time slot')}</option>
                                        {(() => {
                                            const now = new Date();
                                            // 15-min buffer: never show a slot starting in < 15 mins
                                            const todayThreshold = new Date(now.getTime() + 15 * 60000); // 30 min buffer

                                            const allowedSlots = settings?.deliveryTimes || [];
                                            const availableSlots = [];

                                            allowedSlots.forEach(timeValue => {
                                                const [hours, mins] = timeValue.split(':').map(Number);
                                                const displayTime = formatDeliveryRange(timeValue);

                                                // 1. Add for TODAY if still available
                                                const slotDateToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, mins);
                                                if (slotDateToday > todayThreshold) {
                                                    availableSlots.push({
                                                        value: `today|${timeValue}`,
                                                        label: displayTime,
                                                        period: 'today',
                                                        timeValue
                                                    });
                                                }

                                                // 2. Add for TOMORROW (Always available)
                                                availableSlots.push({
                                                    value: `tomorrow|${timeValue}`,
                                                    label: displayTime,
                                                    period: 'tomorrow',
                                                    timeValue
                                                });
                                            });

                                            // Sort: Today first, then by time
                                            availableSlots.sort((a, b) => {
                                                if (a.period !== b.period) return a.period === 'today' ? -1 : 1;
                                                return a.timeValue.localeCompare(b.timeValue);
                                            });

                                            return availableSlots.slice(0, 2).map(slot => (
                                                <option key={slot.value} value={slot.value}>
                                                    {slot.label}
                                                </option>
                                            ));
                                        })()}
                                    </select>
                                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        {t('Choose your preferred delivery time (available slots from now until 11:30 PM)')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
                            <h2 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6 flex items-center gap-2">
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
                            <h2 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6">{t('Order Summary')}</h2>

                            <div className="space-y-4 mb-6">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-4 group">
                                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-600 bg-white">
                                            <img
                                                src={item.image || `${API_BASE_URL}/products/${item._id || item.id}/image`}
                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100?text=No+Image'; }}
                                                alt={item.title}
                                                className="h-full w-full object-cover object-center"
                                            />
                                        </div>
                                        <div className="flex flex-1 flex-col justify-center min-w-0">
                                            {(() => {
                                                const fullTitle = t(item, 'title') || item.title || item.name || t('Product');
                                                const titleParts = fullTitle.split('(');
                                                const mainTitle = titleParts[0].trim();
                                                const bracketContent = titleParts.length > 1 ? `(${titleParts.slice(1).join('(')}` : '';

                                                return (
                                                    <div className="flex flex-col min-w-0">
                                                        {item.isFromAd ? (
                                                            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1 leading-normal" title={fullTitle}>
                                                                {fullTitle}
                                                            </h3>
                                                        ) : (
                                                            <>
                                                                <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate" title={mainTitle}>
                                                                    {mainTitle}
                                                                </h3>
                                                                {bracketContent && (
                                                                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate" title={bracketContent}>
                                                                        {bracketContent}
                                                                    </span>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                            {item.storeId && (
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <Store size={10} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                        {getStoreName(item.storeId, stores)}
                                                    </p>
                                                </div>
                                            )}
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('Qty')}: {item.quantity}</p>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">₹{(item.price * item.quantity).toFixed(0)}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeFromCart(item.id)}
                                            className="self-center p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                                            aria-label={t('Remove item')}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">{t('Subtotal')}</span>
                                    <span className="font-medium text-gray-900 dark:text-white">₹{cartTotal.toFixed(0)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">{t('Delivery Charge')}</span>
                                    {hasCoins ? (
                                        <div className="text-right">
                                            <span className="font-medium text-green-600 dark:text-green-400">FREE</span>
                                            <p className="text-xs text-yellow-600 dark:text-yellow-500 flex items-center justify-end gap-1">
                                                <span>🪙</span> Coin Applied
                                            </p>
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
            </div>

            {/* Sticky Action Footer - Mobile Only */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 p-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 md:hidden pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{t('Total')}</span>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">₹{finalTotal.toFixed(0)}</span>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={isNavigating}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isNavigating ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                {t('Loading...')}
                            </>
                        ) : (
                            <>
                                <ShoppingBag size={20} />
                                {t('Review Order')}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
