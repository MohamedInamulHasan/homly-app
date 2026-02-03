import { Link, useLocation } from 'react-router-dom';
import { Home, Store, ShoppingCart, User, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const MobileFooter = () => {
    const location = useLocation();
    const { cartCount } = useCart();

    const { user } = useAuth(); // Add auth context

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
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            {/* Gap/Spacer at top */}
            <div className="h-2 bg-gradient-to-b from-transparent to-white/50 dark:to-gray-900/50"></div>

            {/* Footer Container */}
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl border-t border-gray-200/50 dark:border-gray-700/50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
                <div className="flex justify-around items-center px-1 pt-2 pb-6">
                    {navItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.label}
                                to={item.path}
                                className="relative flex flex-col items-center justify-center gap-0.5 group"
                            >
                                {/* Icon Container */}
                                <div className={`relative p-2 rounded-xl transition-all duration-300 ${active
                                    ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 shadow-md shadow-blue-400/50 dark:shadow-blue-600/50 scale-105'
                                    : 'bg-gray-100 dark:bg-gray-700/50 group-hover:bg-gray-200 dark:group-hover:bg-gray-600/50 group-hover:scale-105'
                                    }`}>
                                    <item.icon
                                        size={18}
                                        strokeWidth={active ? 2.5 : 2}
                                        className={`transition-all duration-300 ${active
                                            ? 'text-white'
                                            : 'text-gray-600 dark:text-gray-300'
                                            }`}
                                    />
                                    {item.path === '/cart' && cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-gradient-to-br from-red-500 to-red-600 text-white text-[8px] font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-md animate-bounce">
                                            {cartCount}
                                        </span>
                                    )}
                                </div>

                                {/* Label */}
                                <span className={`text-[8px] font-semibold transition-all duration-300 ${active
                                    ? 'text-blue-600 dark:text-blue-400'
                                    : 'text-gray-500 dark:text-gray-400'
                                    }`}>
                                    {item.label}
                                </span>

                                {/* Active Indicator Dot */}
                                {active && (
                                    <div className="absolute -bottom-0.5 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
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
