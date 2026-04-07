import { Link, useLocation } from 'react-router-dom';
import { Home, Store, ShoppingCart, User, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const MobileFooter = () => {
    const location = useLocation();
    const { cartCount } = useCart();

    const { user } = useAuth(); // Add auth context
    const { t } = useLanguage();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/store', icon: Store, label: 'Store' },
        { path: user ? '/orders' : '/login', icon: Package, label: 'Orders' },
        { path: user ? '/profile' : '/login', icon: User, label: user ? 'Profile' : 'Login' }, // Dynamic label/path
    ];

    // Hide footer on specific pages
    if (location.pathname.startsWith('/product/') ||
        location.pathname === '/checkout' ||
        location.pathname === '/order-confirmation') {
        return null;
    }

    return (
        <div className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>

            {/* Content Container */}
            <div className="w-full">
                <div className="flex justify-around items-center px-2 py-2">
                    {navItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.label}
                                to={item.path}
                                className="relative flex flex-col items-center justify-center gap-0.5 group"
                            >
                                {/* Icon Container */}
                                <div className={`relative p-2.5 rounded-xl transition-all duration-300 ${active
                                    ? 'bg-[#2E5A2E] shadow-lg shadow-[#2E5A2E]/20 scale-110'
                                    : 'bg-gray-100 dark:bg-gray-700/50 group-hover:bg-gray-200 dark:group-hover:bg-gray-600/50'
                                    }`}>
                                    <item.icon
                                        size={19}
                                        strokeWidth={active ? 2.5 : 2}
                                        className={`transition-all duration-300 ${active
                                            ? 'text-[#CBF9B2]'
                                            : 'text-gray-600 dark:text-gray-300'
                                            }`}
                                    />
                                    {item.path === '/cart' && cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-md animate-bounce">
                                            {cartCount}
                                        </span>
                                    )}
                                </div>

                                {/* Label */}
                                <span className={`text-[10px] font-bold transition-all duration-300 mt-1 ${active
                                    ? 'text-[#2E5A2E] dark:text-green-400'
                                    : 'text-gray-400 dark:text-gray-500 font-medium'
                                    }`}>
                                    {t(item.label)}
                                </span>

                                {/* Active Indicator Dot */}
                                {active && (
                                    <div className="absolute -bottom-1 w-1.5 h-1.5 bg-[#2E5A2E] dark:bg-green-400 rounded-full shadow-sm"></div>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MobileFooter;
