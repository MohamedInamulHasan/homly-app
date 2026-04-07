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
            className={`group relative bg-white dark:bg-gray-800 rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 aspect-[16/9] md:aspect-[2.4/1] w-full cursor-pointer border border-gray-100 dark:border-gray-700/50 ${!isOpen ? 'grayscale opacity-75' : ''}`}
        >
            {/* Full Background Image */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700" />
                <img
                    src={store.image || `${API_BASE_URL}/stores/${store._id || store.id}/image`}
                    alt={store.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 z-10"
                    loading="lazy"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/800x450?text=Store";
                    }}
                />
                
                {/* Dark Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Top Status Badge */}
            {!isOpen && (
                <div className="absolute top-4 right-4 z-20">
                    <span className="px-3 py-1 bg-red-600/90 backdrop-blur-sm rounded-full text-[10px] font-black text-white uppercase tracking-wider shadow-lg">
                        {t('Closed')}
                    </span>
                </div>
            )}

            {/* Content Section - Overlaid on Green Banner at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 py-2.5 px-4 z-20 overflow-hidden">
                {/* Semi-transparent Green Banner Strip */}
                <div className="absolute inset-0 bg-[#2E5A2E]/75 backdrop-blur-md border-t border-white/10" />
                
                <div className="relative z-10">
                    <h3 className="text-white text-[15px] font-semibold tracking-tight leading-tight mb-0.5 drop-shadow-sm">
                        {t(store, 'name')}
                    </h3>
                    <div className="flex items-center gap-1.5 opacity-90">
                        <MapPin size={10} className="text-[#CBF9B2] flex-shrink-0" />
                        <p className="text-gray-100 text-[11px] font-normal truncate">
                            {store.address || t('No address')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Action - Floating Arrow (Synced with slimmer banner) */}
            <div className="absolute bottom-4 right-4 z-20">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                    isOpen 
                    ? 'bg-[#CBF9B2] text-[#2E5A2E] scale-90 group-hover:scale-105 active:scale-90' 
                    : 'bg-black/20 text-gray-400'
                }`}>
                    <ArrowRight size={16} />
                </div>
            </div>
        </div>
    );
};

export default StoreCard;
