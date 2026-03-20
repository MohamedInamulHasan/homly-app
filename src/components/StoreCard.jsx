import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Store, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { isStoreOpen, formatTime12h } from '../utils/storeHelpers';
import { API_BASE_URL } from '../utils/api';

const StoreCard = ({ store }) => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const isOpen = isStoreOpen(store);

    const handleVisit = () => {
        if (isOpen) {
            navigate(`/store/${store._id || store.id}`);
        }
    };

    return (
        <div
            onClick={handleVisit}
            className={`group relative bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-700 cursor-pointer flex flex-col h-full ${!isOpen ? 'grayscale opacity-80' : ''}`}
        >
            {/* Image Placeholder/Image */}
            <div className="relative h-56 overflow-hidden">
                <img
                    src={store.image || `${API_BASE_URL}/stores/${store._id || store.id}/image`}
                    alt={store.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/400x300?text=Store";
                    }}
                />

                {/* Advanced Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

                {/* Status Badge - Floating & Glassmorphism */}
                <div className="absolute top-3 right-3 z-20">
                    <div className={`backdrop-blur-md px-2.5 py-1 rounded-xl shadow-xl border border-white/20 flex items-center gap-1.5 ${isOpen
                        ? 'bg-emerald-500/80 text-white'
                        : 'bg-red-500/80 text-white'
                        }`}>
                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isOpen ? 'bg-white' : 'bg-white/80'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                            {isOpen ? t('Open') : t('Closed')}
                        </span>
                    </div>
                </div>

                {!isOpen && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="bg-white/10 backdrop-blur-[2px] w-full h-full flex items-center justify-center">
                            <span className="bg-red-600/90 text-white text-xs font-black px-6 py-2 rounded-full shadow-2xl transform -rotate-12 border-2 border-white tracking-widest uppercase">
                                {t('Currently Closed')}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-6 flex flex-col flex-grow gap-4">
                <div className="space-y-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 line-clamp-1">
                        {t(store, 'name')}
                    </h3>
                    <div className="flex items-center text-gray-400 dark:text-gray-500">
                        <MapPin size={14} className="mr-1.5 flex-shrink-0 text-blue-500/60" />
                        <span className="text-sm font-medium truncate">{store.address || t('No address')}</span>
                    </div>
                </div>

                {/* Timing Pill */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 flex items-center justify-between border border-gray-100 dark:border-gray-800/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-xl">
                            <Clock size={14} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider leading-none mb-1">{t('Store Hours')}</span>
                            <span className="text-sm font-black text-gray-700 dark:text-gray-200">
                                {store.timingType === 'permanent'
                                    ? t('Always Open')
                                    : (store.openingTime && store.closingTime
                                        ? `${formatTime12h(store.openingTime)} - ${formatTime12h(store.closingTime)}`
                                        : store.timing || '9:00 AM - 9:00 PM')}
                            </span>
                        </div>
                    </div>
                    {isOpen && (
                        <div className="hidden sm:flex p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                            <ArrowRight size={14} />
                        </div>
                    )}
                </div>

                {/* Action Area */}
                <div className="mt-auto">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleVisit();
                        }}
                        disabled={!isOpen}
                        className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 ${isOpen
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/10 hover:shadow-blue-500/30 active:scale-[0.98]'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        <span>{isOpen ? t('Visit Store') : t('Closed')}</span>
                        <Store size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StoreCard;
