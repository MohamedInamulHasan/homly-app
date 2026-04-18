import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const HomeIcon = ({ isActive }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
            d="M3.5 10.5C3.5 10.5 3.5 10.5 3.5 10.5V17.5C3.5 19.1569 4.84315 20.5 6.5 20.5H17.5C19.1569 20.5 20.5 19.1569 20.5 17.5V10.5C20.5 10.5 20.5 10.5 20.5 10.5" 
            stroke={isActive ? "white" : "black"} 
            strokeWidth="1.5" 
            strokeLinecap="round" 
        />
        <path 
            d="M2.5 11.5L10.4571 4.39824C11.3323 3.61528 12.6677 3.61528 13.5429 4.39824L21.5 11.5" 
            stroke={isActive ? "white" : "black"} 
            strokeWidth="1.5" 
            strokeLinecap="round" 
        />
        <path 
            d="M9.5 20.5V16.5C9.5 15.1193 10.6193 14 12 14C13.3807 14 14.5 15.1193 14.5 16.5V20.5" 
            stroke={isActive ? "white" : "black"} 
            strokeWidth="1.5" 
            strokeLinecap="round" 
        />
    </svg>
);

const StoreIcon = ({ isActive }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="scale-110">
        <path 
            d="M4.5 8.5V16.5C4.5 18.7091 6.29086 20.5 8.5 20.5H15.5C17.7091 20.5 19.5 18.7091 19.5 16.5V8.5C19.5 7.39543 18.6046 6.5 17.5 6.5H6.5C5.39543 6.5 4.5 7.39543 4.5 8.5Z" 
            stroke={isActive ? "white" : "black"} 
            strokeWidth="1.5" 
        />
        <path 
            d="M8.5 6.5V6C8.5 4.067 10.067 2.5 12 2.5C13.933 2.5 15.5 4.067 15.5 6V6.5" 
            stroke={isActive ? "white" : "black"} 
            strokeWidth="1.5" 
            strokeLinecap="round" 
        />
        <path 
            d="M8.5 10.5H15.5" 
            stroke={isActive ? "white" : "black"} 
            strokeWidth="1.5" 
            strokeLinecap="round" 
        />
    </svg>
);

const OrdersIcon = ({ isActive }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
            d="M5 5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V5Z" 
            stroke={isActive ? "white" : "black"} 
            strokeWidth="1.5" 
        />
        <path 
            d="M8.5 8H15.5" 
            stroke={isActive ? "white" : "black"} 
            strokeWidth="1.5" 
            strokeLinecap="round" 
        />
        <path 
            d="M8.5 12H15.5" 
            stroke={isActive ? "white" : "black"} 
            strokeWidth="1.5" 
            strokeLinecap="round" 
        />
        <path 
            d="M8.5 16H12.5" 
            stroke={isActive ? "white" : "black"} 
            strokeWidth="1.5" 
            strokeLinecap="round" 
        />
    </svg>
);

const ProfileIcon = ({ isActive }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle 
            cx="12" 
            cy="8" 
            r="3.5" 
            stroke={isActive ? "white" : "black"} 
            strokeWidth="1.5" 
        />
        <path 
            d="M5.5 19C5.5 16.5147 8.41015 14.5 12 14.5C15.5899 14.5 18.5 16.5147 18.5 19" 
            stroke={isActive ? "white" : "black"} 
            strokeWidth="1.5" 
            strokeLinecap="round" 
        />
    </svg>
);

const MobileFooter = () => {
    const location = useLocation();
    const { cartCount } = useCart();
    const { user } = useAuth();
    const { t } = useLanguage();

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/', icon: HomeIcon, label: 'Home' },
        { path: '/store', icon: StoreIcon, label: 'Store' },
        { path: user ? '/orders' : '/login', icon: OrdersIcon, label: 'Orders' },
        { path: user ? '/profile' : '/login', icon: ProfileIcon, label: user ? t('profile') : t('login') },
    ];

    if (location.pathname.startsWith('/product/') ||
        location.pathname === '/checkout' ||
        location.pathname === '/order-confirmation') {
        return null;
    }

    return (
        <div className="fixed z-50 bottom-6 left-1/2 -translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-auto md:right-6 md:translate-x-0">
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/20 dark:border-gray-800/50 rounded-full px-6 py-2 md:px-2 md:py-6 flex flex-row md:flex-col items-center gap-4 shadow-xl shadow-black/5">
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.label}
                            to={item.path}
                            className="relative flex items-center justify-center group"
                        >
                             <div 
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${active ? 'bg-black shadow-lg shadow-black/20 scale-110 md:scale-125' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                            >
                                <item.icon isActive={active} />
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default MobileFooter;
