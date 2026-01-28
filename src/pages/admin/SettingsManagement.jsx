import { useState, useEffect } from 'react';
import { Save, Clock, CheckCircle, AlertCircle, Power, ShieldAlert } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';

const SettingsManagement = () => {
    const { settings, updateDeliverySettings, updateMaintenanceMode } = useData();
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

                // Format for display
                const date = new Date();
                date.setHours(i, j, 0, 0);
                const displayTime = date.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });

                slots.push({ id: timeString, label: displayTime });
            }
        }
        return slots;
    };

    const allSlots = generateAllSlots();

    // Initialize state with allowed slots from context
    const [allowedSlots, setAllowedSlots] = useState([]);

    useEffect(() => {
        if (settings) {
            if (settings.deliveryTimes) {
                setAllowedSlots(settings.deliveryTimes);
            }
            if (settings.maintenanceMode !== undefined) {
                setMaintenanceMode(settings.maintenanceMode);
            }
        }
    }, [settings]);

    // Maintenance Mode State
    const [maintenanceMode, setMaintenanceMode] = useState(false);

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
            await updateDeliverySettings(allowedSlots);
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
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Clock className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('Delivery Settings')}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('Configure available delivery time slots for customers')}</p>
                </div>
            </div>

            {/* Global Message Toast */}
            {message.text && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-fade-in ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'}`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}


            {/* Maintenance Mode / App Status Section */}
            <div className={`mb-6 rounded-2xl shadow-sm border overflow-hidden transition-all ${maintenanceMode
                ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800'
                : 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800'
                }`}>
                <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full ${maintenanceMode ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'}`}>
                            {maintenanceMode ? <ShieldAlert size={32} /> : <CheckCircle size={32} />}
                        </div>
                        <div>
                            <h3 className={`text-lg font-bold ${maintenanceMode ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>
                                {maintenanceMode ? t('Not Taking Orders (Maintenance Mode)') : t('Taking Orders (Online)')}
                            </h3>
                            <p className={`text-sm mt-1 ${maintenanceMode ? 'text-red-600/80 dark:text-red-400/80' : 'text-green-600/80 dark:text-green-400/80'}`}>
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
                            ${maintenanceMode ? 'bg-red-600 focus:ring-red-500' : 'bg-green-600 focus:ring-green-500'}
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
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('Time Slots')}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('Select the time slots you want to make available for delivery')}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={selectWorkingHours}
                            className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
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
                                        flex items-center justify-center py-2 px-3 rounded-xl border text-sm font-medium transition-all
                                        ${isSelected
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-md transform scale-105'
                                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-300 dark:hover:border-blue-700'
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
                        className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
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
