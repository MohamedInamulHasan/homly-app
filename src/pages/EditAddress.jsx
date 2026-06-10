import { useState, useEffect } from 'react';
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
    const { user, setUser } = useAuth();
    const { t } = useLanguage();
    const { updateProfile } = useData();

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

    useEffect(() => {
        // Fetch cities list
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

        // Initialize form with user data
        if (user) {
            setFormData({
                fullName: user.fullName || user.name || '',
                mobile: user.mobile || user.phone || '',
                street: user.address?.street || '',
                city: user.address?.city || '',
                zip: user.address?.zip || user.zip || '',
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
        if (!formData.fullName || !formData.mobile || !formData.street || !formData.city) {
            setMessage({ type: 'error', text: t('Please fill all required fields') });
            return;
        }

        setIsSaving(true);
        const profileData = {
            name: formData.fullName, // Map fullName to name for backend
            mobile: formData.mobile,
            address: {
                street: formData.street,
                city: formData.city,
                zip: formData.zip,
                country: 'India'
            },
            location: formData.location
        };

        try {
            const result = await updateProfile(profileData);
            if (result) {
                // Update local auth state with returned data
                setUser(result);
                localStorage.setItem('userInfo', JSON.stringify(result));
                setMessage({ type: 'success', text: t('Address updated successfully!') });
                setTimeout(() => navigate('/profile'), 1500);
            }
        } catch (err) {
            console.error('Update Profile Error:', err);
            setMessage({ type: 'error', text: t('Failed to update address') });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#E8EAEF] dark:bg-gray-900 pb-24 transition-colors duration-200">
            {/* Premium Header */}
            <div className="fixed top-0 left-0 right-0 z-50 w-full bg-[#CBF9B2] rounded-b-[2.5rem] px-5 py-4 shadow-sm">
                <div className="max-w-xl mx-auto flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="w-11 h-11 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-sm text-gray-900 dark:text-white transition-transform active:scale-95">
                        <ArrowLeft size={22} />
                    </button>
                    <div className="flex flex-col text-center flex-1 min-w-0 mx-2">
                        <h1 className="text-[18px] font-bold text-gray-900 tracking-tight leading-tight truncate">{t('My Address')}</h1>
                        <p className="text-[10px] sm:text-[11px] font-semibold text-gray-700 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">{t('Manage delivery locations & ensures reachability')}</p>
                    </div>
                    <div className="w-11 flex-shrink-0" />
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
                    {/* Location Detection Block */}
                    <div className="relative">
                        {isDetecting && (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: [0.8, 1.2, 1.4], opacity: [0, 0.3, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                                className="absolute inset-0 bg-[#2E5A2E]/20 rounded-[2rem] z-0"
                            />
                        )}
                        <button
                            type="button"
                            onClick={handleDetectLocation}
                            disabled={isDetecting}
                            className={`w-full relative z-10 bg-white dark:bg-gray-800 border-2 border-dashed p-5 rounded-[2rem] flex items-center justify-between gap-3 group transition-all duration-300 active:scale-[0.98] ${
                                isDetecting ? 'border-[#2E5A2E] dark:border-[#CBF9B2] bg-green-50/30 dark:bg-[#CBF9B2]/5' : 
                                formData.location ? 'border-[#2E5A2E] dark:border-[#CBF9B2] bg-green-50/30 dark:bg-[#CBF9B2]/5' : 'border-gray-200 dark:border-gray-700'
                            }`}
                        >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="relative flex-shrink-0">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                                        isDetecting ? 'bg-[#2E5A2E] dark:bg-[#CBF9B2] text-white dark:text-gray-900 shadow-lg shadow-green-200 scale-110' :
                                        formData.location ? 'bg-green-100 dark:bg-[#CBF9B2]/20 text-[#2E5A2E] dark:text-[#CBF9B2]' : 'bg-gray-50 dark:bg-gray-700 text-gray-400'
                                    }`}>
                                        <AnimatePresence mode="wait">
                                            {isDetecting ? (
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
                                    {isDetecting && (
                                        <motion.div
                                            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                            className="absolute inset-0 rounded-full bg-[#2E5A2E]"
                                        />
                                    )}
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                    <h3 className={`font-bold text-[15px] transition-colors duration-300 truncate ${isDetecting || formData.location ? 'text-[#2E5A2E] dark:text-[#CBF9B2]' : 'text-gray-900 dark:text-white'}`}>
                                        {isDetecting ? t('Finding location...') : formData.location ? t('Location Attached') : t('Pin exact GPS')}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                                        {isDetecting ? t('Please wait while we sync labels...') : formData.location ? t('Fast delivery with precise coordinates') : t('Tap to use current location')}
                                    </p>
                                </div>
                            </div>
                            <div className={`w-8 h-8 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors ${
                                isDetecting || formData.location ? 'bg-white dark:bg-gray-700 border-[#2E5A2E]/20 dark:border-[#CBF9B2]/20 text-[#2E5A2E] dark:text-[#CBF9B2]' : 'border-gray-100 dark:border-gray-700 text-gray-400'
                            }`}>
                                 <ArrowLeft size={16} className={`transition-transform duration-300 ${isDetecting ? 'rotate-90' : 'rotate-180'}`} />
                            </div>
                        </button>
                    </div>

                    {/* Form Fields */}
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-6 shadow-sm border border-gray-50 dark:border-gray-700 space-y-5">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2 px-1">{t('Recipient Name')}</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Enter full name"
                                className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-[#CBF9B2] transition-all text-sm font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2 px-1">{t('Mobile Number')}</label>
                            <input
                                type="tel"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                placeholder="10-digit mobile number"
                                className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-[#CBF9B2] transition-all text-sm font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2 px-1">{t('Street / Area')}</label>
                            <textarea
                                name="street"
                                rows="3"
                                value={formData.street}
                                onChange={handleChange}
                                placeholder="House no, Street name, Landmark"
                                className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-[#CBF9B2] transition-all text-sm font-medium resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2 px-1">{t('City')}</label>
                                <select
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-[#CBF9B2] transition-all text-sm font-medium appearance-none"
                                >
                                    <option value="">{t('Select City')}</option>
                                    {cities.map((city, idx) => <option key={idx} value={city}>{city}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-300 uppercase tracking-widest mb-2 px-1">{t('Pincode')}</label>
                                <input
                                    type="text"
                                    name="zip"
                                    value={formData.zip}
                                    onChange={handleChange}
                                    placeholder="6XXXXX"
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white rounded-2xl focus:ring-2 focus:ring-[#CBF9B2] transition-all text-sm font-medium"
                                />
                            </div>
                        </div>

                    <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full bg-black text-white py-4 rounded-full font-bold text-[15px] active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {isSaving ? t('Saving Changes...') : t('Update Address')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditAddress;
