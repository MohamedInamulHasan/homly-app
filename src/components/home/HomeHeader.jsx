import React from 'react';
import { MapPin, ShoppingCart, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

const HomeHeader = () => {
    const { cartCount } = useCart();
    const { user } = useAuth();
    const { t } = useLanguage();

    const displayAddress = (() => {
        if (!user) return t('Select Location');
        
        // Priority 1: Structured address fields (Street, City)
        if (user.address && (user.address.street || user.address.city || user.address.address)) {
            const parts = [];
            if (user.address.street) parts.push(user.address.street);
            if (user.address.city) parts.push(user.address.city);
            if (parts.length === 0 && user.address.address) {
                // Handle cases where full address is in a single field
                return user.address.address.length > 30 ? user.address.address.substring(0, 30) + '...' : user.address.address;
            }
            return parts.join(', ');
        }
        
        // Priority 2: Full user.location (if not a URL)
        if (user.location && !user.location.startsWith('http')) {
            return user.location;
        }
        
        // Priority 3: Fallback to structured fields even if partial
        if (user.address?.street) return user.address.street;
        if (user.address?.city) return user.address.city;
        
        return t('Add Location');
    })();

    return (
        <header className="flex items-center justify-between px-4 py-4 bg-transparent transition-colors duration-200">
            {/* Location Selector */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-black/5">
                    <MapPin className="text-red-500" size={20} />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{t('Delivery to')}</span>
                    <Link to="/edit-address" className="flex items-center gap-1 group cursor-pointer border-b border-dashed border-gray-400 max-w-[180px]">
                        <span className="text-sm font-bold text-gray-900 truncate">{displayAddress}</span>
                        <ChevronDown size={14} className="text-gray-400" />
                    </Link>
                </div>
            </div>

            {/* Icons */}
            <div className="flex items-center gap-3">
                <Link 
                    to="/cart"
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-black/5 relative hover:bg-gray-50 transition-all active:scale-95"
                >
                    <ShoppingCart size={20} className="text-gray-700" />
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white">
                            {cartCount}
                        </span>
                    )}
                </Link>
            </div>
        </header>
    );
};

export default HomeHeader;
