import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { useUserProfile } from '../hooks/queries/useUsers';
import { getStoreName } from '../utils/storeHelpers';
import { CreditCard, Truck, MapPin, ShieldCheck, ShoppingBag, ArrowLeft, Store, Trash2, ChevronLeft, Pencil } from 'lucide-react';
import { API_BASE_URL } from '../utils/api';

const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const directPurchase = location.state?.directPurchase;
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
        paymentMethod: 'cod'
    });
    const [isNavigating, setIsNavigating] = useState(false);
    const [isEditingAddress, setIsEditingAddress] = useState(true);

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
    useEffect(() => {
        if (user) {
            // Handle both flat structure (legacy) and nested schema structure
            const addressObj = user.address || {};
            const isAddressObject = typeof user.address === 'object' && user.address !== null;

            // Check if we have valid address data to show card view
            // We check for minimal requirement: street address + city + zip
            const hasValidAddress = (isAddressObject && addressObj.street && addressObj.city && addressObj.zip) ||
                (!isAddressObject && user.address && user.city && (user.zip || user.pincode));

            setFormData(prev => ({
                ...prev,
                fullName: user.fullName || user.name || prev.fullName,
                mobile: user.mobile || user.phone || prev.mobile,
                // If user.address is an object, use .street, otherwise use it directly if string
                address: (isAddressObject ? addressObj.street : user.address) || prev.address,
                city: (isAddressObject ? addressObj.city : user.city) || prev.city,
                zip: (isAddressObject ? addressObj.zip : (user.zip || user.pincode)) || prev.zip
            }));

            // Auto-switch to card view if address exists
            if (hasValidAddress) {
                setIsEditingAddress(false);
            }
        }
    }, [user]);

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
        const hasGoldProduct = displayItems.some(item => item.isGold);
        const finalDeliveryCharge = (hasCoins || hasGoldProduct) ? 0 : 20;

        navigate('/order-confirmation', {
            state: {
                formData: {
                    ...formData,
                    name: formData.fullName,
                    pincode: formData.zip
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
    const deliveryCharge = (hasCoins || hasGoldProduct) ? 0 : 20;
    const finalTotal = displayTotal + deliveryCharge;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 pb-24 transition-colors duration-200">
            <div className="max-w-7xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors flex-shrink-0 mb-8"
                >
                    <ChevronLeft className="text-gray-600 dark:text-white" size={24} />
                </button>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                    <ShieldCheck className="text-blue-600 dark:text-blue-400" />
                    {t('Checkout')}
                </h1>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Shipping Address */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <MapPin className="text-blue-600 dark:text-blue-400" size={24} />
                                {t('Shipping Details')}
                            </h2>
                            {!isEditingAddress ? (
                                // Address Card View
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700/50 dark:to-gray-700/30 rounded-xl p-6 border-2 border-blue-100 dark:border-gray-600 relative group transition-all hover:shadow-md">
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
                                                            {(() => {
                                                                const [hours, minutes] = formData.deliveryTime.split(':');
                                                                const date = new Date();
                                                                date.setHours(parseInt(hours), parseInt(minutes));
                                                                return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                                                            })()}
                                                        </span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
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
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-colors resize-none"
                                            placeholder={t('Enter your full address')}
                                        />
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
                                </div>
                            )}

                            {/* Delivery Time - Always Visible */}
                            <div className="mt-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    {t('Preferred Delivery Time')} <span className="text-red-500">*</span>
                                </label>
                                {(() => {
                                    const now = new Date();
                                    const startTime = new Date(now.getTime() + 30 * 60000);

                                    // Round to next 30-minute slot
                                    const minutes = startTime.getMinutes();
                                    if (minutes < 30) {
                                        startTime.setMinutes(30, 0, 0);
                                    } else {
                                        startTime.setMinutes(0, 0, 0);
                                        startTime.setHours(startTime.getHours() + 1);
                                    }

                                    const endOfDay = new Date(startTime);
                                    endOfDay.setHours(23, 30, 0, 0);

                                    if (startTime.getHours() >= 23 && startTime.getMinutes() > 30) {
                                        startTime.setDate(startTime.getDate() + 1);
                                        startTime.setHours(9, 0, 0, 0);
                                        endOfDay.setDate(endOfDay.getDate() + 1);
                                    }

                                    // Generate all slots
                                    const allSlots = [];
                                    const currentSlot = new Date(startTime);
                                    let slotCount = 0;

                                    while (currentSlot <= endOfDay && slotCount < 50) {
                                        const hours = currentSlot.getHours();
                                        const mins = currentSlot.getMinutes();
                                        const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
                                        const displayTime = currentSlot.toLocaleTimeString('en-US', {
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            hour12: true
                                        });

                                        allSlots.push({
                                            value: timeString,
                                            label: displayTime,
                                            hour: hours
                                        });

                                        currentSlot.setMinutes(currentSlot.getMinutes() + 30);
                                        slotCount++;
                                    }

                                    // Filter by admin settings
                                    const allowedSlots = settings?.deliveryTimes || [];
                                    const availableSlots = allSlots.filter(slot =>
                                        allowedSlots.length === 0 || allowedSlots.includes(slot.value)
                                    );

                                    // Group by time periods
                                    const morning = availableSlots.filter(s => s.hour >= 6 && s.hour < 12);
                                    const afternoon = availableSlots.filter(s => s.hour >= 12 && s.hour < 17);
                                    const evening = availableSlots.filter(s => s.hour >= 17 && s.hour < 21);
                                    const night = availableSlots.filter(s => s.hour >= 21 || s.hour < 6);

                                    const periods = [
                                        { name: t('Morning'), slots: morning, icon: '🌅' },
                                        { name: t('Afternoon'), slots: afternoon, icon: '☀️' },
                                        { name: t('Evening'), slots: evening, icon: '🌆' },
                                        { name: t('Night'), slots: night, icon: '🌙' }
                                    ].filter(p => p.slots.length > 0);

                                    return (
                                        <div className="space-y-4">
                                            {periods.map((period) => (
                                                <div key={period.name} className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
                                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                                        <span>{period.icon}</span>
                                                        {period.name}
                                                    </h3>
                                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                                        {period.slots.map((slot) => (
                                                            <button
                                                                key={slot.value}
                                                                type="button"
                                                                onClick={() => setFormData({ ...formData, deliveryTime: slot.value })}
                                                                className={`px-2 py-1.5 md:px-3 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all ${formData.deliveryTime === slot.value
                                                                    ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400 ring-offset-1 dark:ring-offset-gray-700'
                                                                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                                                                    }`}
                                                            >
                                                                {slot.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                            {availableSlots.length === 0 && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                                                    {t('No delivery slots available for today. Please try again tomorrow.')}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })()}
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    {t('Select your preferred delivery time')}
                                </p>
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
                                        <div className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border bg-white relative ${item.isGold ? 'border-yellow-400 ring-2 ring-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.3)]' : item.isFromAd ? 'border-orange-400 ring-2 ring-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.3)]' : 'border-gray-200 dark:border-gray-600'}`}>
                                            <img
                                                src={item.image || `${API_BASE_URL}/products/${item._id || item.id}/image`}
                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100?text=No+Image'; }}
                                                alt={item.adTitle || item.title}
                                                className="h-full w-full object-cover object-center"
                                            />
                                            {/* Gold Badge */}
                                            {item.isGold && (
                                                <div className="absolute top-0 left-0 right-0 h-4 bg-yellow-400/90 flex items-center justify-center">
                                                    <span className="text-[8px] font-bold text-yellow-950 uppercase tracking-tighter">Gold</span>
                                                </div>
                                            )}
                                            {/* Special Offer Badge */}
                                            {item.isFromAd && !item.isGold && (
                                                <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
                                                    <span className="text-[8px] font-bold text-white uppercase tracking-tighter">Special Offer</span>
                                                </div>
                                            )}
                                            {(() => {
                                                const unitText = item.unit;
                                                if (!unitText) return null;
                                                return (
                                                    <div className="absolute bottom-0 right-0 bg-gray-900/80 backdrop-blur-sm px-1.5 py-0.5 rounded-tl-md rounded-br-lg z-10">
                                                        <span className="text-[10px] font-bold text-white leading-none block">
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
                                                    return <h3 className={`text-sm font-medium text-gray-900 dark:text-white ${titleClass}`} title={fullTitle}>{fullTitle}</h3>;
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
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('Qty')}: {item.quantity}</p>
                                                {/* Unit display moved to image overlay */}
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
                                                <p className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center justify-end gap-1 font-bold">
                                                    <span>⚡</span> Gold Benefit
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
            </div>

            {/* Sticky Action Footer - Mobile Only - Redesigned */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-50 md:hidden pb-[calc(0.75rem+env(safe-area-inset-bottom))] px-4 py-3">
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
            </div>
        </div>
    );
};

export default Checkout;
