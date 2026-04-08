import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { ArrowLeft, MapPin, Check, Navigation, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../utils/api';

const EditAddress = () => {
    const navigate = useNavigate();
    const { user, setUser } = useAuth();
    const { t } = useLanguage();
    const { updateUser } = useData();

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
        setIsDetecting(true);
        setMessage({ type: '', text: '' });

        if (!navigator.geolocation) {
            setMessage({ type: 'error', text: t('Geolocation not supported') });
            setIsDetecting(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const mapsLink = `https://www.google.com/maps/place/${latitude}+${longitude}/@${latitude},${longitude},17z`;
                setFormData(prev => ({ ...prev, location: mapsLink }));
                setIsDetecting(false);
                setMessage({ type: 'success', text: t('GPS coordinates saved!') });
                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            },
            (error) => {
                console.error('GPS Error:', error);
                let errText = t('Unable to get location');
                if (error.code === 1) errText = t('Permission denied');
                setMessage({ type: 'error', text: errText });
                setIsDetecting(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.fullName || !formData.mobile || !formData.street || !formData.city) {
            setMessage({ type: 'error', text: t('Please fill all required fields') });
            return;
        }

        setIsSaving(true);
        const updatedUser = {
            ...user,
            fullName: formData.fullName,
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
            await updateUser(updatedUser);
            setUser(updatedUser);
            localStorage.setItem('userInfo', JSON.stringify(updatedUser));
            setMessage({ type: 'success', text: t('Address updated successfully!') });
            setTimeout(() => navigate('/profile'), 1500);
        } catch (err) {
            setMessage({ type: 'error', text: t('Failed to update address') });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#E8EAEF] dark:bg-gray-900 pb-12 transition-colors duration-200">
            {/* Premium Header */}
            <div className="fixed top-0 left-0 right-0 z-50 w-full bg-[#CBF9B2] rounded-b-[2.5rem] px-5 py-6 shadow-sm">
                <div className="max-w-xl mx-auto flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="w-11 h-11 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-sm text-gray-900 dark:text-white transition-transform active:scale-95">
                        <ArrowLeft size={22} />
                    </button>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">{t('My Address')}</h1>
                    <div className="w-11" />
                </div>
            </div>

            <div className="pt-[115px] max-w-xl mx-auto px-5">
                {/* Status Message */}
                {message.text && (
                    <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                        {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
                        <span className="text-sm font-semibold">{message.text}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Location Detection Block */}
                    <button
                        type="button"
                        onClick={handleDetectLocation}
                        disabled={isDetecting}
                        className="w-full bg-white dark:bg-gray-800 border border-dashed border-[#2E5A2E] dark:border-green-500/50 p-5 rounded-[2rem] flex items-center justify-between group hover:bg-[#2E5A2E]/5 transition-all duration-300 active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${formData.location ? 'bg-green-100 dark:bg-green-900/30 text-[#2E5A2E]' : 'bg-[#E8F5E9] dark:bg-gray-700 text-[#2E5A2E] dark:text-green-400'}`}>
                                {isDetecting ? <Navigation className="animate-pulse" size={22} /> : <MapPin size={22} />}
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-gray-900 dark:text-white text-[15px]">
                                    {formData.location ? t('Location Attached') : t('Pin exact GPS')}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {t('Fast delivery with precise coordinates')}
                                </p>
                            </div>
                        </div>
                        <div className="w-8 h-8 rounded-full border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-400">
                             <ArrowLeft size={16} className="rotate-180" />
                        </div>
                    </button>

                    {/* Form Fields */}
                    <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] p-6 shadow-sm border border-gray-50 dark:border-gray-700 space-y-5">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-1">{t('Recipient Name')}</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Enter full name"
                                className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900/50 border-none rounded-2xl focus:ring-2 focus:ring-[#CBF9B2] transition-all text-sm font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-1">{t('Mobile Number')}</label>
                            <input
                                type="tel"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                placeholder="10-digit mobile number"
                                className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900/50 border-none rounded-2xl focus:ring-2 focus:ring-[#CBF9B2] transition-all text-sm font-medium"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-1">{t('Street / Area')}</label>
                            <textarea
                                name="street"
                                rows="3"
                                value={formData.street}
                                onChange={handleChange}
                                placeholder="House no, Street name, Landmark"
                                className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900/50 border-none rounded-2xl focus:ring-2 focus:ring-[#CBF9B2] transition-all text-sm font-medium resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-1">{t('City')}</label>
                                <select
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900/50 border-none rounded-2xl focus:ring-2 focus:ring-[#CBF9B2] transition-all text-sm font-medium appearance-none"
                                >
                                    <option value="">{t('Select City')}</option>
                                    {cities.map((city, idx) => <option key={idx} value={city}>{city}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-1">{t('Pincode')}</label>
                                <input
                                    type="text"
                                    name="zip"
                                    value={formData.zip}
                                    onChange={handleChange}
                                    placeholder="6XXXXX"
                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900/50 border-none rounded-2xl focus:ring-2 focus:ring-[#CBF9B2] transition-all text-sm font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Mobile Pull-up Card for Update Address */}
                    <div className="h-20 md:hidden" /> {/* Spacer */}
                    
                    <motion.div 
                        initial={{ y: '100%', x: '-50%' }}
                        animate={{ y: 0, x: '-50%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="bg-white dark:bg-gray-800 rounded-t-[3rem] pt-8 pb-8 px-8 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] fixed bottom-0 max-w-md w-full left-1/2 border-t border-gray-100 dark:border-gray-700 z-50 md:hidden"
                    >
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full bg-black text-white py-4 rounded-full font-bold text-[15px] active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {isSaving ? t('Saving Changes...') : t('Update Address')}
                        </button>
                    </motion.div>

                    {/* Desktop Button */}
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="hidden md:block w-full bg-black text-white py-5 rounded-full font-bold text-[15px] shadow-xl shadow-gray-200 dark:shadow-none active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isSaving ? t('Saving Changes...') : t('Update Address')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditAddress;
