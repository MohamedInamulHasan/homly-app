import React from 'react';
import { MapPin, Bell, ShoppingCart, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const HomeHeader = () => {
    const { cartCount } = useCart();

    return (
        <header className="flex items-center justify-between px-4 py-4 bg-transparent transition-colors duration-200">
            {/* Location Selector */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-black/5">
                    <MapPin className="text-red-500" size={20} />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Delivery to</span>
                    <div className="flex items-center gap-1 group cursor-pointer border-b border-dashed border-gray-400">
                        <span className="text-sm font-bold text-gray-900">Home, New York</span>
                        <ChevronDown size={14} className="text-gray-400" />
                    </div>
                </div>
            </div>

            {/* Icons */}
            <div className="flex items-center gap-3">
                <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-black/5 relative hover:bg-gray-50 transition-all active:scale-95">
                    <Bell size={20} className="text-gray-700" />
                    <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <Link 
                    to="/cart"
                    className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-black/5 relative hover:bg-gray-50 transition-all active:scale-95"
                >
                    <ShoppingCart size={20} className="text-gray-700" />
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center shadow-sm border border-white">
                            {cartCount}
                        </span>
                    )}
                </Link>
            </div>
        </header>
    );
};

export default HomeHeader;
