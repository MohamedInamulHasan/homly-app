import { useState, useContext, useEffect } from 'react';
import { User, Package, Settings, ChevronRight, Globe, LogOut, Moon, Sun, Shield, Languages, Wrench, MessageCircle, Phone, Bookmark, Store } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import AuthContext from '../context/AuthContext';
import { useOrders } from '../hooks/queries/useOrders';
import { useUserProfile } from '../hooks/queries/useUsers';
import { formatOrderDate } from '../utils/dateUtils';
import { useData } from '../context/DataContext';


const Profile = () => {
    const { theme, toggleTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const { setIsFooterHidden } = useData();
    const { user: authUser, logout } = useContext(AuthContext);

    // React Query Hooks
    const { data: userProfile } = useUserProfile();
    const { data: orders = [] } = useOrders();

    // Use profile data if available, otherwise fall back to auth context user
    const user = userProfile?.data || authUser;
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Manage footer visibility when modal is open
    useEffect(() => {
        if (showLogoutModal) {
            setIsFooterHidden(true);
        } else {
            setIsFooterHidden(false); 
        }

        // Cleanup on unmount
        return () => {
            setIsFooterHidden(false);
        };
    }, [showLogoutModal, setIsFooterHidden]);

    // Calculate real-time order statistics
    const processingOrders = orders.filter(order => order.status === 'Processing').length;
    const outForDeliveryOrders = orders.filter(order => order.status === 'Shipped' || order.status === 'Out for Delivery').length;
    const deliveredOrders = orders.filter(order => order.status === 'Delivered').length;
    const cancelledOrders = orders.filter(order => order.status === 'Cancelled').length;

    // Get most recent order
    const recentOrder = orders.length > 0 ? orders[0] : null;

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 py-8 md:py-12 transition-colors duration-200">
            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl transform transition-all scale-100 opacity-100 flex flex-col items-center">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                            <LogOut size={32} className="text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">{t('Sign Out')}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
                            {t('Are you sure you want to sign out?')}
                        </p>
                        <div className="flex gap-4 w-full">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                {t('Cancel')}
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-md shadow-red-500/20 transition-colors"
                            >
                                {t('Sign Out')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                {/* Profile Header */}
                <div className="relative animate-in-faded glass-card rounded-[2rem] shadow-2xl p-8 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 group overflow-hidden">
                    {/* Background Decorative Gradient */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors duration-700"></div>
                    
                    {/* Avatar Container */}
                    <div className="relative flex-shrink-0">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-[1.5rem] shadow-xl shadow-blue-500/20 group-hover:scale-105 transition-transform duration-500 relative z-10">
                            <User size={48} className="text-white drop-shadow-md" />
                        </div>
                        <div className="absolute inset-0 bg-blue-400 blur-2xl opacity-20 animate-pulse"></div>
                    </div>

                    <div className="flex-1 text-center sm:text-left relative z-10">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-1">
                            {user?.name || 'Guest User'}
                        </h1>
                        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-gray-500 dark:text-gray-400">
                            <p className="flex items-center gap-2 text-sm sm:text-base font-medium">
                                <span className="opacity-60">{user?.email || 'Not logged in'}</span>
                            </p>
                            {user?.mobile && (
                                <p className="hidden sm:flex items-center gap-2 text-sm font-medium">
                                    <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                                    <span className="opacity-60">{user.mobile}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Coin Badge - Floating Style */}
                    <div className="sm:absolute sm:top-8 sm:right-8 mt-4 sm:mt-0 px-4 py-2 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-base font-black shadow-xl shadow-yellow-500/20 flex items-center gap-2 transition-transform hover:scale-110 cursor-default">
                        <span className="text-xl">🪙</span>
                        <span>{user.coins || 0}</span>
                    </div>
                </div>

                {/* Orders Dashboard */}
                <div className="animate-in-faded glass-card rounded-[2rem] shadow-xl overflow-hidden mb-8 transition-all hover:shadow-2xl" style={{ animationDelay: '0.1s' }}>
                    <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700/50 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/40">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-xl">
                                <Package className="text-blue-600 dark:text-blue-400" size={20} />
                            </div>
                            {t('Orders Dashboard')}
                        </h2>
                        <Link to="/orders" className="text-sm font-bold text-blue-600 dark:text-blue-400 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 transition-all duration-300">
                            {t('All Orders')}
                        </Link>
                    </div>
                    
                    <div className="p-8">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                            {[
                                { label: t('Processing'), count: processingOrders, color: 'from-amber-400 to-orange-500', shadow: 'shadow-orange-500/20' },
                                { label: t('On Delivery'), count: outForDeliveryOrders, color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20' },
                                { label: t('Delivered'), count: deliveredOrders, color: 'from-green-500 to-emerald-600', shadow: 'shadow-green-500/20' },
                                { label: t('Cancelled'), count: cancelledOrders, color: 'from-rose-500 to-pink-600', shadow: 'shadow-rose-500/20' }
                            ].map((item, idx) => (
                                <div key={idx} className={`p-6 bg-gradient-to-br ${item.color} rounded-[1.5rem] shadow-lg ${item.shadow} group hover:-translate-y-2 transition-all duration-300 text-center`}>
                                    <p className="text-3xl font-black text-white drop-shadow-md mb-1">{item.count}</p>
                                    <p className="text-[10px] sm:text-xs text-white/90 font-bold uppercase tracking-wider">{item.label}</p>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-8">
                            {recentOrder ? (
                                <Link to="/orders" className="flex items-center justify-between p-5 bg-white/40 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-600/30 rounded-2xl hover:bg-white/60 dark:hover:bg-gray-700/50 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 glass-card rounded-xl flex items-center justify-center shadow-inner">
                                            <Package className="text-blue-500 group-hover:scale-110 transition-transform" size={28} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-base">{t('Track Recent Order')}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                                #{String(recentOrder._id || recentOrder.id).slice(-6).toUpperCase()} • {formatOrderDate(recentOrder.createdAt || recentOrder.date)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/30 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                        <ChevronRight size={20} />
                                    </div>
                                </Link>
                            ) : (
                                <div className="p-6 bg-gray-50/50 dark:bg-gray-800/40 rounded-2xl text-center border border-dashed border-gray-200 dark:border-gray-700">
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium italic">{t('No orders yet - let\'s go shopping!')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-8">
                    {/* News & Offers */}
                    <Link to="/news" className="animate-in-faded glass-card glass-card-hover rounded-[1.8rem] p-6 flex items-center justify-between group" style={{ animationDelay: '0.2s' }}>
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-gradient-to-br from-pink-500 to-rose-600 rounded-[1.2rem] shadow-lg shadow-pink-500/20 group-hover:rotate-6 transition-transform">
                                <Globe className="text-white" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">{t('News & Offers')}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t('Latest deals and updates')}</p>
                            </div>
                        </div>
                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-pink-50 dark:bg-pink-900/30 text-pink-500 transition-all group-hover:bg-pink-500 group-hover:text-white">
                            <ChevronRight size={20} />
                        </div>
                    </Link>

                    {/* Role-based Action Cards */}
                    {user && (() => {
                        const roles = Array.isArray(user.role) ? user.role : [user.role || 'customer'];
                        const cardDefs = [
                            { role: 'store_admin', to: '/my-store', icon: <Store size={24} />, title: t('My Store'), desc: t('Manage your products'), color: 'from-teal-500 to-emerald-600', shadow: 'shadow-teal-500/20' },
                            { role: 'service_admin', to: '/my-service', icon: <Wrench size={24} />, title: t('My Service'), desc: t('Manage service items'), color: 'from-sky-500 to-blue-600', shadow: 'shadow-sky-500/20' },
                            { role: 'delivery_boy', to: '/admin', icon: <Package size={24} />, title: t('Delivery Panel'), desc: t('Manage deliveries'), color: 'from-orange-500 to-amber-600', shadow: 'shadow-orange-500/20' },
                            { role: 'admin', to: '/admin', icon: <Shield size={24} />, title: t('Admin Dashboard'), desc: t('Full management'), color: 'from-indigo-500 to-blue-700', shadow: 'shadow-indigo-500/20' },
                        ].filter(c => roles.includes(c.role));

                        return cardDefs.map((card, idx) => (
                            <Link key={idx} to={card.to} className="animate-in-faded glass-card glass-card-hover rounded-[1.8rem] p-6 flex items-center justify-between group" style={{ animationDelay: `${0.3 + idx * 0.1}s` }}>
                                <div className="flex items-center gap-5">
                                    <div className={`p-4 bg-gradient-to-br ${card.color} rounded-[1.2rem] shadow-lg ${card.shadow} group-hover:-rotate-3 transition-transform text-white`}>
                                        {card.icon}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">{card.title}</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{card.desc}</p>
                                    </div>
                                </div>
                                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-50 dark:bg-gray-700/50 transition-all group-hover:bg-gray-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-gray-900">
                                    <ChevronRight size={20} />
                                </div>
                            </Link>
                        ));
                    })()}

                    {/* Saved Products */}
                    <Link to="/saved-products" className="animate-in-faded glass-card glass-card-hover rounded-[1.8rem] p-6 flex items-center justify-between group" style={{ animationDelay: '0.4s' }}>
                        <div className="flex items-center gap-5">
                            <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-[1.2rem] shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                <Bookmark className="text-white fill-current" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">{t('Saved Products')}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{t('Favorite items list')}</p>
                            </div>
                        </div>
                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-500 transition-all group-hover:bg-blue-600 group-hover:text-white">
                            <ChevronRight size={20} />
                        </div>
                    </Link>
                </div>

                {/* Bottom Actions - Settings & Logout */}
                <div className="animate-in-faded" style={{ animationDelay: '0.5s' }}>
                    <div className="glass-card rounded-[2rem] overflow-hidden divide-y divide-gray-100 dark:divide-gray-700/50">
                        {/* Appearance */}
                        <div className="p-6 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer group" onClick={toggleTheme}>
                            <div className="flex items-center gap-5">
                                <div className="p-3.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-all">
                                    {theme === 'dark' ? <Moon className="text-white" size={20} /> : <Sun className="text-white" size={20} />}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">{t('Theme')}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                                        {theme === 'dark' ? t('Dark Mode') : t('Light Mode')}
                                    </p>
                                </div>
                            </div>
                            <div className="h-7 w-12 rounded-full relative bg-gray-200 dark:bg-indigo-600 p-1 flex items-center transition-all">
                                <div className={`h-5 w-5 bg-white rounded-full shadow-md transition-all duration-300 ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>
                        </div>

                        {/* Logout */}
                        <div className="p-6 flex items-center justify-between hover:bg-red-50/50 dark:hover:bg-red-900/20 transition-colors cursor-pointer group" onClick={handleLogout}>
                            <div className="flex items-center gap-5">
                                <div className="p-3.5 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-lg shadow-red-500/20 group-hover:rotate-12 transition-all">
                                    <LogOut className="text-white" size={20} />
                                </div>
                                <p className="font-black text-red-600 dark:text-red-400 tracking-wide uppercase text-sm">{t('Sign Out')}</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Floating WhatsApp Button - Enhanced */}
            <a
                href="https://wa.me/919500171980"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-36 right-6 z-[60] group flex items-center justify-center p-4 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-110 transition-all duration-300 animate-bounce-subtle"
                aria-label="Chat on WhatsApp"
            >
                <span className="absolute right-full mr-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-3 py-1.5 rounded-xl text-sm font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {t('Chat with us')}
                </span>
                <svg
                    viewBox="0 0 24 24"
                    className="w-8 h-8 md:w-9 md:h-9 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
            </a>
        </div>
    );
};

export default Profile;
