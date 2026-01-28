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
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 z-50 transition-colors duration-200" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}>
            <div className="flex justify-around items-center h-16 py-2">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.label} // Use label as key to avoid duplicates when paths are identical (e.g. /login)
                            to={item.path}
                            className={`relative flex flex-col items-center justify-center w-full h-full space-y-0.5 ${active
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                }`}
                        >
                            <div className="relative">
                                <item.icon size={16} strokeWidth={active ? 2.5 : 2} />
                                {item.path === '/cart' && cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[8px] font-bold rounded-full h-3 w-3 flex items-center justify-center border-2 border-white dark:border-gray-900">
                                        {cartCount}
                                    </span>
                                )}
                            </div>
                            <span className="text-[8px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default MobileFooter;
