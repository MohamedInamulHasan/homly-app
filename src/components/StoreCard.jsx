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
            className={`group relative bg-white dark:bg-gray-800 rounded-[2rem] overflow-hidden transition-all duration-300 aspect-[16/9] md:aspect-[3/2] lg:aspect-[4/3] w-full cursor-pointer`}
        >
            {/* Full Background Image */}
            <div className={`absolute inset-0 z-0 ${!isOpen ? 'opacity-60' : ''}`}>
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700" />
                <img
                    src={store.image || `${API_BASE_URL}/stores/${store._id || store.id}/image`}
                    alt={store.name}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 z-10 ${!isOpen ? '' : ''}`}
                    loading="lazy"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/800x450?text=Store";
                    }}
                />
                
                {/* Dark Gradient Overlay for Text Readability */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent transition-opacity duration-300 ${!isOpen ? 'opacity-100 bg-black/20' : 'opacity-90 group-hover:opacity-100'}`} />
            </div>

            {/* Status Overlays (Centered - Product Card Style) */}
            {!isOpen && (
                <div className="absolute inset-0 z-20 bg-black/10 flex items-center justify-center backdrop-blur-[1px]">
                    <span className="bg-gray-800 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg animate-in fade-in zoom-in-95 duration-500">
                        {t('Closed')}
                    </span>
                </div>
            )}

            {/* Content Section - Overlaid on White Banner at Bottom */}
            <div className={`absolute bottom-0 left-0 right-0 py-2.5 px-4 z-20 overflow-hidden transition-all duration-300`}>
                {/* Solid White Banner Strip */}
                <div className="absolute inset-0 bg-white dark:bg-gray-800 border-t border-gray-50 dark:border-gray-700" />
                
                <div className={`relative z-10 ${!isOpen ? 'blur-[2px] opacity-80' : ''}`}>
                    <h3 className="text-gray-900 dark:text-white text-[15px] font-semibold tracking-tight leading-tight mb-0.5 truncate">
                        {t(store, 'name')}
                    </h3>
                    <div className="flex items-center gap-1.5 opacity-90">
                        <MapPin size={10} className="text-[#2E5A2E] dark:text-[#CBF9B2] flex-shrink-0" />
                        <p className="text-gray-500 dark:text-gray-400 text-[11px] font-normal truncate">
                            {store.address || t('No address')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Action - Floating Arrow (Synced with slimmer banner) */}
            <div className={`absolute bottom-4 right-4 z-20 transition-all duration-300 ${!isOpen ? 'blur-[1.5px] opacity-40 scale-75' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isOpen 
                    ? 'bg-[#2E5A2E] dark:bg-[#CBF9B2] text-white dark:text-gray-900 scale-90 group-hover:scale-105 active:scale-90' 
                    : 'bg-black/20 text-gray-400'
                }`}>
                    <ArrowRight size={16} />
                </div>
            </div>
        </div>
    );
};

export default StoreCard;
