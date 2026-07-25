import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { ArrowLeft, MapPin, Check, Navigation, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../utils/api';
import { getCurrentLocation } from '../utils/locationHelpers';

const EditAddress = () => {
    const navigate = useNavigate();
    const { user, setUser, updateGuest } = useAuth();
    const { t, language } = useLanguage();
    const { updateProfile } = useData();
    const [showLocationError, setShowLocationError] = useState(false);
    const locationRef = useRef(null);
    const fullNameRef = useRef(null);
    const mobileRef = useRef(null);
    const streetRef = useRef(null);
    const cityRef = useRef(null);

    const [formData, setFormData] = useState({
        fullName: '',
        mobile: '',
        street: '',
        city: '',
        zip: '',
        location: '' // GPS Link
    });

    const [cities, setCities] = useState([]);
    const [loadingCities, setLoadingCities] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [fieldErrors, setFieldErrors] = useState({});

    // Security Details for 9500171980
    const [showSecurityModal, setShowSecurityModal] = useState(false);
    const [securityPassword, setSecurityPassword] = useState('');
    const [showPasswordText, setShowPasswordText] = useState(false);
    const [securityError, setSecurityError] = useState('');
    const [securityVerified, setSecurityVerified] = useState(false);

    const handleVerifySecurityPassword = (e) => {
        e?.preventDefault();
        if (securityPassword === 'Moh@2004') {
            setSecurityVerified(true);
            setShowSecurityModal(false);
            setSecurityError('');
            setTimeout(() => {
                const submitBtn = document.querySelector('button[type="submit"]');
                if (submitBtn) submitBtn.click();
            }, 100);
        } else {
            setSecurityError(language === 'ta' ? 'தவறான கடவுச்சொல்! அணுகல் மறுக்கப்பட்டது.' : 'Incorrect security password! Access denied.');
        }
    };

    useEffect(() => {
        // Fetch cities list
        const fetchCities = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/settings/cities`);
                const data = await response.json();
                if (data.success && data.data && Array.isArray(data.data.value)) {
                    setCities(data.data.value);
                    // Auto-clear if saved city is now marked unavailable
                    setFormData(prev => {
                        if (!prev.city) return prev;
                        const cl = prev.city.toLowerCase();
                        const isUnavail = cl.includes('(') && (cl.includes('not available') || cl.includes('not deliverable') || cl.includes('unavailable'));
                        return isUnavail ? { ...prev, city: '' } : prev;
                    });
                }
            } catch (error) {
                console.error('Error fetching cities:', error);
            } finally {
                setLoadingCities(false);
            }
        };
        fetchCities();

        // Initialize form with user data
        if (user) {
            const userDisplayName = user.fullName || user.name || '';
            const isGuestName = userDisplayName.startsWith('User_') || userDisplayName === 'Guest User';
            setFormData({
                fullName: isGuestName ? '' : userDisplayName,
                mobile: user.mobile || user.phone || '',
                street: user.address?.street || '',
                city: user.address?.city || '',
                zip: '630702',
                location: user.location || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if ((name === 'mobile' || name === 'zip') && !/^\d*$/.test(value)) return;
        if (name === 'mobile' && value.length > 10) return;
        if (name === 'zip' && value.length > 6) return;
        
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDetectLocation = async () => {
        if (isDetecting) return;
        
        setIsDetecting(true);
        setMessage({ type: '', text: '' });
        console.log('📍 EditAddress: Starting location detection...');

        try {
            const result = await getCurrentLocation();
            console.log('📍 EditAddress: Detection result:', result);

            if (result.success) {
                setFormData(prev => ({ ...prev, location: result.mapsLink }));
                setShowLocationError(false);
                setMessage({ type: 'success', text: t('GPS coordinates saved!') });
                // Auto-clear success message after 3 seconds
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            } else {
                console.error('📍 EditAddress: Detection failed:', result.message);
                setMessage({ type: 'error', text: t(result.message) });
            }
        } catch (err) {
            console.error('📍 EditAddress: Fatal detection error:', err);
            setMessage({ type: 'error', text: t('Unable to get location') });
        } finally {
            setIsDetecting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const errors = {};
        if (!formData.fullName) errors.fullName = true;
        if (!formData.mobile) errors.mobile = true;
        if (!formData.street) errors.street = true;
        if (!formData.city) {
            errors.city = true;
        } else {
            const cl = formData.city.toLowerCase();
            if (cl.includes('(') && (cl.includes('not available') || cl.includes('not deliverable') || cl.includes('unavailable'))) {
                errors.city = true;
            }
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            // Scroll to first error
            if (errors.fullName) fullNameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            else if (errors.mobile) mobileRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            else if (errors.street) streetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            else if (errors.city) cityRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        // Validate Mobile Number (10 digits)
        if (!/^\d{10}$/.test(formData.mobile)) {
            setFieldErrors(prev => ({ ...prev, mobile: true }));
            mobileRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        // Security password check for number 9500171980 ONLY when adding or updating address newly
        const cleanMobile = (formData.mobile || '').toString().replace(/\D/g, '');
        if (cleanMobile.endsWith('9500171980') && !securityVerified) {
            setShowSecurityModal(true);
            return;
        }

        setFieldErrors({});
        setIsSaving(true);

        try {
            // Link guest profile or switch to existing profile using phone number
            const freshUser = await updateGuest(formData.fullName, formData.mobile);
            const activeUser = freshUser || user;

            // Retrieve the updated JWT token from localStorage after account switch/link
            const token = localStorage.getItem('authToken');
            const config = token ? {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            } : {};

            const profileData = {
                name: formData.fullName,
                mobile: formData.mobile,
                address: {
                    street: formData.street,
                    city: formData.city,
                    zip: formData.zip,
                    country: 'India'
                },
                location: formData.location
            };

            const result = await updateProfile(profileData, config);
            if (result) {
                // Update local auth state with returned data
                setUser(result);
                localStorage.setItem('userInfo', JSON.stringify(result));
                setMessage({ type: 'success', text: t('Address updated successfully!') });
                setTimeout(() => navigate('/profile'), 1500);
            }
        } catch (err) {
            console.error('Update Profile Error:', err);
            const errMsg = err.response?.data?.message || err.message || t('Failed to update address');
            setMessage({ type: 'error', text: errMsg });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#E8EAEF] dark:bg-gray-900 pb-24 transition-colors duration-200">
            {/* Premium Header */}
            <div className="fixed top-0 left-0 right-0 z-50 w-full bg-[#CBF9B2] rounded-b-[2.5rem] px-4 pt-4 pb-4 shadow-sm overflow-hidden">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/30 dark:bg-[#CBF9B2]/20 rounded-full blur-3xl pointer-events-none"></div>
                <div className="relative z-10">
                    <div className="max-w-7xl mx-auto px-2 relative min-h-[42px]">
                        <div className="absolute left-2 top-1/2 -translate-y-1/2">
                            <button 
                                onClick={() => navigate(-1)} 
                                className="w-[42px] h-[42px] flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-sm text-gray-900 dark:text-white transition-transform active:scale-95 border border-gray-100/50 dark:border-gray-700/50"
                            >
                                <ArrowLeft size={22} />
                            </button>
                        </div>
                        <div className="flex flex-col items-center text-center pt-1">
                            <h1 className="text-[18px] font-bold text-gray-900 tracking-tight leading-tight truncate">{t('My Address')}</h1>
                            <p className="text-[10px] sm:text-[11px] font-semibold text-gray-700 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">{t('Manage delivery locations & ensures reachability')}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-[95px] max-w-xl mx-auto px-5">
                {/* Status Message */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                        {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                        <span className="text-sm font-semibold">{message.text}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Location Detection Block — slim horizontal bar */}
                    <div ref={locationRef}>
                        <div className="flex items-center justify-between mb-2 px-1">
                            <span className="text-[11px] font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest">{t('GPS Location')}</span>
                            <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">{t('Optional')}</span>
                        </div>

                        <button
                            type="button"
                            onClick={handleDetectLocation}
                            disabled={isDetecting}
                            className={`w-full bg-white dark:bg-gray-800 border rounded-2xl px-4 py-3 flex items-center gap-3 transition-all duration-300 active:scale-[0.98] ${
                                isDetecting ? 'border-[#2E5A2E] dark:border-[#CBF9B2] bg-green-50/30' :
                                formData.location ? 'border-[#2E5A2E] dark:border-[#CBF9B2] bg-green-50/30 dark:bg-[#CBF9B2]/5' :
                                'border-gray-200 dark:border-gray-700'
                            }`}
                        >
                            {/* Icon */}
                            <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-300 ${
                                isDetecting ? 'bg-[#2E5A2E] text-white' :
                                formData.location ? 'bg-green-100 dark:bg-[#CBF9B2]/20 text-[#2E5A2E] dark:text-[#CBF9B2]' :
                                'bg-gray-100 dark:bg-gray-700 text-gray-400'
                            }`}>
                                <AnimatePresence mode="wait">
                                    {isDetecting ? (
                                        <motion.div key="spin" animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                                            <Navigation size={16} />
                                        </motion.div>
                                    ) : (
                                        <motion.div key={formData.location ? 'pin-on' : 'pin-off'} initial={{ scale: 0.6 }} animate={{ scale: 1 }}>
                                            <MapPin size={16} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Text */}
                            <div className="flex-1 text-left min-w-0">
                                <p className={`text-[13px] font-bold truncate ${
                                    formData.location ? 'text-[#2E5A2E] dark:text-[#CBF9B2]' :
                                    isDetecting ? 'text-[#2E5A2E] dark:text-[#CBF9B2]' : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                    {isDetecting ? t('Finding location...') : formData.location ? t('Location Attached') : t('Tap to attach GPS location')}
                                </p>
                                {!isDetecting && (
                                    <p className="text-[11px] text-gray-400 truncate">
                                        {formData.location ? t('Tap to update location') : t('Helps us deliver faster')}
                                    </p>
                                )}
                            </div>

                            {/* Arrow */}
                            <ArrowLeft size={14} className={`flex-shrink-0 rotate-180 transition-colors ${
                                formData.location ? 'text-[#2E5A2E] dark:text-[#CBF9B2]' : 'text-gray-300 dark:text-gray-600'
                            }`} />
                        </button>



                        {/* Remove link when attached */}
                        {formData.location && !isDetecting && (
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, location: '' }))}
                                className="mt-1.5 w-full text-center text-[11px] text-gray-400 hover:text-red-500 transition-colors py-1"
                            >
                                {t('Remove location')}
                            </button>
                        )}
                    </div>

                    {/* Form Fields */}
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-6 shadow-sm border border-gray-50 dark:border-gray-700 space-y-5">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 px-1">{t('Recipient Name')}</label>
                            <input
                                ref={fullNameRef}
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={e => { handleChange(e); setFieldErrors(p => ({...p, fullName: false})); }}
                                placeholder="Enter full name"
                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-gray-200 outline-none transition-all text-sm shadow-none"
                            />
                            {fieldErrors.fullName && (
                                <div className="relative mt-2 bg-white dark:bg-gray-850 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 text-[13px] font-normal flex items-center gap-2.5 w-fit shadow-md z-10">
                                    <div className="absolute -top-[5px] left-4 w-2 h-2 bg-white dark:bg-gray-855 border-t border-l border-gray-300 dark:border-gray-600 rotate-45 transform"></div>
                                    <div className="w-5 h-5 rounded bg-[#F59E0B] text-white flex items-center justify-center text-[12px] font-black flex-shrink-0">!</div>
                                    <span>{language === 'ta' ? 'தயவுசெய்து இந்த புலத்தை நிரப்பவும்.' : 'Please fill out this field.'}</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 px-1">{t('Mobile Number')}</label>
                            <input
                                ref={mobileRef}
                                type="tel"
                                name="mobile"
                                value={formData.mobile}
                                onChange={e => { handleChange(e); setFieldErrors(p => ({...p, mobile: false})); }}
                                placeholder="10-digit mobile number"
                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-gray-200 outline-none transition-all text-sm shadow-none"
                            />
                            {fieldErrors.mobile && (
                                <div className="relative mt-2 bg-white dark:bg-gray-855 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 text-[13px] font-normal flex items-center gap-2.5 w-fit shadow-md z-10">
                                    <div className="absolute -top-[5px] left-4 w-2 h-2 bg-white dark:bg-gray-855 border-t border-l border-gray-300 dark:border-gray-600 rotate-45 transform"></div>
                                    <div className="w-5 h-5 rounded bg-[#F59E0B] text-white flex items-center justify-center text-[12px] font-black flex-shrink-0">!</div>
                                    <span>{language === 'ta' ? 'தயவுசெய்து இந்த புலத்தை நிரப்பவும்.' : 'Please fill out this field.'}</span>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 px-1">{t('Street / Area')}</label>
                            <textarea
                                ref={streetRef}
                                name="street"
                                rows="3"
                                value={formData.street}
                                onChange={e => { handleChange(e); setFieldErrors(p => ({...p, street: false})); }}
                                placeholder="House no, Street name, Landmark"
                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-gray-200 outline-none transition-all text-sm resize-none shadow-none"
                            />
                            {fieldErrors.street && (
                                <div className="relative mt-2 bg-white dark:bg-gray-855 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 text-[13px] font-normal flex items-center gap-2.5 w-fit shadow-md z-10">
                                    <div className="absolute -top-[5px] left-4 w-2 h-2 bg-white dark:bg-gray-855 border-t border-l border-gray-300 dark:border-gray-600 rotate-45 transform"></div>
                                    <div className="w-5 h-5 rounded bg-[#F59E0B] text-white flex items-center justify-center text-[12px] font-black flex-shrink-0">!</div>
                                    <span>{language === 'ta' ? 'தயவுசெய்து இந்த புலத்தை நிரப்பவும்.' : 'Please fill out this field.'}</span>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 px-1">{t('City')}</label>
                                {loadingCities ? (
                                    <div className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-400">{t('Loading cities...')}</div>
                                ) : (
                                    <select
                                        ref={cityRef}
                                        value={formData.city}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setFormData(prev => ({ ...prev, city: val }));
                                            setFieldErrors(prev => ({ ...prev, city: false }));
                                        }}
                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-gray-200 outline-none transition-all text-sm shadow-none"
                                    >
                                        <option value="">{t('Select City')}</option>
                                        {cities.map((city) => {
                                            const m = city.match(/\(([^)]+)\)/);
                                            const isUnavail = m && (() => {
                                                const inner = m[1].toLowerCase();
                                                return inner.includes('not available') || inner.includes('not deliverable') || inner.includes('unavailable');
                                            })();
                                            const baseName = city.replace(/\s*\([^)]*\)/, '').trim();
                                            const note = m ? m[1] : '';
                                            return (
                                                <option
                                                    key={city}
                                                    value={city}
                                                    disabled={!!isUnavail}
                                                    style={isUnavail ? { color: '#9CA3AF' } : {}}
                                                >
                                                    {isUnavail ? `${baseName} (${note})` : city}
                                                </option>
                                            );
                                        })}
                                    </select>
                                )}
                                {fieldErrors.city && (
                                    <div className="relative mt-2 bg-white dark:bg-gray-855 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-gray-200 text-[13px] font-normal flex items-center gap-2.5 w-fit shadow-md z-10">
                                        <div className="absolute -top-[5px] left-4 w-2 h-2 bg-white dark:bg-gray-855 border-t border-l border-gray-300 dark:border-gray-600 rotate-45 transform"></div>
                                        <div className="w-5 h-5 rounded bg-[#F59E0B] text-white flex items-center justify-center text-[12px] font-black flex-shrink-0">!</div>
                                        <span>{language === 'ta' ? 'தயவுசெய்து இந்த புலத்தை நிரப்பவும்.' : 'Please fill out this field.'}</span>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 px-1">{t('Pincode')}</label>
                                <input
                                    type="text"
                                    name="zip"
                                    value="630702"
                                    readOnly
                                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600 text-gray-400 rounded-xl focus:outline-none text-sm cursor-not-allowed"
                                />
                            </div>
                        </div>

                    <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full bg-black text-white py-4 rounded-full font-bold text-[15px] active:scale-[0.98] transition-all"
                            >
                                {isSaving ? t('Saving Changes...') : t('Update Address')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Security Password Modal for 9500171980 */}
            <AnimatePresence>
                {showSecurityModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-gray-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-800 text-center"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
                                🔒
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                {language === 'ta' ? 'பாதுகாப்பு சரிபார்ப்பு' : 'Security Verification'}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 leading-relaxed">
                                {language === 'ta' 
                                    ? '9500171980 எண்ணிற்கு முகவரியை மாற்ற கடவுச்சொல்லை உள்ளிடவும்.'
                                    : 'Security verification required for 9500171980 to add/update address.'}
                            </p>

                            <form onSubmit={handleVerifySecurityPassword} className="space-y-4">
                                <div className="relative">
                                    <input
                                        type={showPasswordText ? 'text' : 'password'}
                                        value={securityPassword}
                                        onChange={(e) => {
                                            setSecurityPassword(e.target.value);
                                            setSecurityError('');
                                        }}
                                        placeholder={language === 'ta' ? 'கடவுச்சொல்லை உள்ளிடவும்' : 'Enter Security Password'}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-gray-900 dark:text-white"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordText(!showPasswordText)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs font-semibold px-1"
                                    >
                                        {showPasswordText ? (language === 'ta' ? 'மறை' : 'Hide') : (language === 'ta' ? 'காட்டு' : 'Show')}
                                    </button>
                                </div>

                                {securityError && (
                                    <p className="text-xs font-bold text-red-500">
                                        {securityError}
                                    </p>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowSecurityModal(false);
                                            setSecurityPassword('');
                                            setSecurityError('');
                                        }}
                                        className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl text-xs active:scale-95 transition-transform"
                                    >
                                        {language === 'ta' ? 'ரத்து' : 'Cancel'}
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-xl text-xs active:scale-95 transition-transform shadow-md"
                                    >
                                        {language === 'ta' ? 'சரிபார்' : 'Verify'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EditAddress;
