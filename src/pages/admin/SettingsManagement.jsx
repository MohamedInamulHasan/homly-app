import { useState, useEffect } from 'react';
import { Save, Clock, CheckCircle, AlertCircle, Power, ShieldAlert } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatDeliveryRange } from '../../utils/storeHelpers';

const SettingsManagement = () => {
    const { settings, updateDeliverySettings, updateMaintenanceMode, updateDeliveryTimingType, updateMaintenanceMessage } = useData();
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Generate all 30-minute slots for a 24-hour day
    const generateAllSlots = () => {
        const slots = [];
        for (let i = 0; i < 24; i++) {
            for (let j = 0; j < 60; j += 30) {
                const hour = i.toString().padStart(2, '0');
                const minute = j.toString().padStart(2, '0');
                const timeString = `${hour}:${minute}`;

                const displayTime = formatDeliveryRange(timeString);

                slots.push({ id: timeString, label: displayTime });
            }
        }
        return slots;
    };

    const allSlots = generateAllSlots();

    // Initialize state from context - only once to prevent overwriting local edits
    const [allowedSlots, setAllowedSlots] = useState([]);
    const [deliveryTimingMode, setDeliveryTimingMode] = useState('permanent');
    const [hasInitialized, setHasInitialized] = useState(false);

    useEffect(() => {
        if (settings && !hasInitialized) {
            if (settings.deliveryTimes) {
                setAllowedSlots(settings.deliveryTimes);
            }
            if (settings.deliveryTimingType) {
                setDeliveryTimingMode(settings.deliveryTimingType);
            }
            if (settings.maintenanceMode !== undefined) {
                setMaintenanceMode(settings.maintenanceMode);
            }
            if (settings.maintenanceMessage !== undefined) {
                setMaintenanceMessage(settings.maintenanceMessage);
            }
            setHasInitialized(true);
        }
    }, [settings, hasInitialized]);

    // Handle external toggle changes (e.g., from the switch) without overwriting the message
    useEffect(() => {
        if (settings && settings.maintenanceMode !== undefined) {
            setMaintenanceMode(settings.maintenanceMode);
        }
    }, [settings?.maintenanceMode]);

    // Maintenance Mode State
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [maintenanceMessage, setMaintenanceMessage] = useState('');

    const toggleMaintenanceMode = async () => {
        setLoading(true);
        try {
            const newState = !maintenanceMode;
            await updateMaintenanceMode(newState);
            setMaintenanceMode(newState);
            setMessage({ type: 'success', text: t(`App is now ${newState ? 'CLOSED (Maintenance)' : 'OPEN'}`) });
        } catch (error) {
            console.error('Error updating status:', error);
            setMessage({ type: 'error', text: t('Failed to update status.') });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    const toggleSlot = (slotId) => {
        setAllowedSlots(prev => {
            if (prev.includes(slotId)) {
                return prev.filter(id => id !== slotId);
            } else {
                return [...prev, slotId].sort();
            }
        });
    };

    const selectAll = () => {
        setAllowedSlots(allSlots.map(s => s.id));
    };

    const deselectAll = () => {
        setAllowedSlots([]);
    };

    const selectWorkingHours = () => {
        // Select slots between 9:00 AM and 9:00 PM (21:00)
        const workingSlots = allSlots
            .filter(s => {
                const hour = parseInt(s.id.split(':')[0]);
                return hour >= 9 && hour < 21;
            })
            .map(s => s.id);
        setAllowedSlots(workingSlots);
    };

    const handleSave = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await Promise.all([
                updateDeliverySettings(allowedSlots),
                updateDeliveryTimingType(deliveryTimingMode),
                updateMaintenanceMessage(maintenanceMessage)
            ]);
            setMessage({ type: 'success', text: t('Settings saved successfully!') });
        } catch (error) {
            console.error('Error saving settings:', error);
            setMessage({ type: 'error', text: t('Failed to save settings. Please try again.') });
        } finally {
            setLoading(false);
            // Clear message after 3 seconds
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
    };

    return (
        <div className="max-w-6xl">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-[#E8F5E9] dark:bg-[#2E5A2E]/20 rounded-xl">
                    <Clock className="text-[#2E5A2E] dark:text-[#7CA90E]" size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-normal text-gray-900 dark:text-white">{t('Delivery Settings')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('Configure available delivery time slots for customers')}</p>
                </div>
            </div>

            {/* Global Message Toast */}
            {message.text && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-fade-in ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : 'bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'}`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}


            {/* Maintenance Mode / App Status Section */}
            <div className={`mb-6 rounded-2xl border overflow-hidden transition-all ${maintenanceMode
                ? 'bg-gray-50 border-gray-200 dark:bg-gray-800/10 dark:border-gray-700'
                : 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800'
                }`}>
                <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full ${maintenanceMode ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'}`}>
                            {maintenanceMode ? <ShieldAlert size={32} /> : <CheckCircle size={32} />}
                        </div>
                        <div>
                            <h3 className={`text-lg font-normal ${maintenanceMode ? 'text-gray-700 dark:text-gray-300' : 'text-green-700 dark:text-green-400'}`}>
                                {maintenanceMode ? t('Not Taking Orders (Maintenance Mode)') : t('Taking Orders (Online)')}
                            </h3>
                            <p className={`text-sm mt-1 ${maintenanceMode ? 'text-gray-600/80 dark:text-gray-400/80' : 'text-green-600/80 dark:text-green-400/80'}`}>
                                {maintenanceMode
                                    ? t('The app is currently hidden from users and store admins. Only Super Admins can access.')
                                    : t('The app is live and accepting orders from all users.')}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={toggleMaintenanceMode}
                        disabled={loading}
                        className={`
                            relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2
                            ${maintenanceMode ? 'bg-gray-500 focus:ring-gray-400' : 'bg-green-600 focus:ring-green-500'}
                        `}
                    >
                        <span className="sr-only">Use setting</span>
                        <span
                            aria-hidden="true"
                            className={`
                                pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                                ${maintenanceMode ? 'translate-x-6' : 'translate-x-0'}
                            `}
                        />
                    </button>
                </div>

                {/* Maintenance Message Input */}
                <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-700/50">
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                            <label htmlFor="maintenanceMessage" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('Maintenance Message (Shown to users)')}
                            </label>
                            <button
                                onClick={async () => {
                                    setLoading(true);
                                    try {
                                        await updateMaintenanceMessage(maintenanceMessage);
                                        setMessage({ type: 'success', text: t('Message updated successfully!') });
                                    } catch (err) {
                                        setMessage({ type: 'error', text: t('Failed to update message.') });
                                    } finally {
                                        setLoading(false);
                                        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
                                    }
                                }}
                                disabled={loading}
                                className="px-3 py-1 bg-[#2E5A2E] text-white text-xs rounded-lg hover:bg-[#1a3d1a] transition-colors flex items-center gap-1 disabled:opacity-50"
                            >
                                <Save size={14} />
                                {t('Save Message')}
                            </button>
                        </div>
                        <textarea
                            id="maintenanceMessage"
                            rows={3}
                            value={maintenanceMessage}
                            onChange={(e) => setMaintenanceMessage(e.target.value)}
                            placeholder={t('e.g., App opens at 5pm, or System update in progress...')}
                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#2E5A2E] focus:border-transparent transition-all text-gray-900 dark:text-white"
                        />
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            {t('This message will be displayed on the screen when the app is in maintenance mode.')}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-[2rem] border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-normal text-gray-900 dark:text-white">{t('Delivery Slot Mode')}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('Choose how slots appear to customers')}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setDeliveryTimingMode('dynamic')}
                            className={`px-4 py-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${deliveryTimingMode === 'dynamic'
                                ? 'border-[#2E5A2E] bg-[#E8F5E9] text-[#2E5A2E]'
                                : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500'
                                }`}
                        >
                            <span className="font-normal text-sm">{t('Dynamic Refresh')}</span>
                            <span className="text-[10px] opacity-70">{t('Hides past slots automatically')}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setDeliveryTimingMode('permanent')}
                            className={`px-4 py-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${deliveryTimingMode === 'permanent'
                                ? 'border-[#2E5A2E] bg-[#E8F5E9] text-[#2E5A2E]'
                                : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500'
                                }`}
                        >
                            <span className="font-normal text-sm">{t('Permanent Slots')}</span>
                            <span className="text-[10px] opacity-70">{t('Always stays fully visible')}</span>
                        </button>
                    </div>
                </div>

                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-normal text-gray-900 dark:text-white">{t('Time Slots')}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('Select the time slots you want to make available for delivery')}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={selectWorkingHours}
                            className="px-3 py-1.5 text-sm font-normal text-[#2E5A2E] bg-[#E8F5E9] hover:bg-[#CBF9B2] dark:bg-[#2E5A2E]/20 dark:text-[#7CA90E] dark:hover:bg-[#2E5A2E]/30 rounded-lg transition-colors"
                        >
                            {t('Working Hours (9am-9pm)')}
                        </button>
                        <button
                            onClick={selectAll}
                            className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        >
                            {t('Select All')}
                        </button>
                        <button
                            onClick={deselectAll}
                            className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        >
                            {t('Clear All')}
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                        {allSlots.map((slot) => {
                            const isSelected = allowedSlots.includes(slot.id);
                            return (
                                <button
                                    key={slot.id}
                                    onClick={() => toggleSlot(slot.id)}
                                    className={`
                                        flex items-center justify-center py-2 px-3 rounded-xl border text-sm font-medium whitespace-nowrap transition-all
                                        ${isSelected
                                            ? 'bg-[#2E5A2E] border-[#2E5A2E] text-white transform scale-105'
                                            : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#CBF9B2] dark:hover:border-[#2E5A2E]'
                                        }
                                    `}
                                >
                                    {slot.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        {/* Message moved to top */}
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full sm:w-auto px-6 py-3 bg-[#2E5A2E] text-white rounded-xl font-normal hover:bg-[#1a3d1a] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save size={20} />
                        )}
                        {t('Save Settings')}
                    </button>
                </div>
            </div>
        </div >
    );
};

export default SettingsManagement;
