import { useState, useContext } from 'react';
import { User, Package, Settings, ChevronRight, Globe, LogOut, Moon, Sun, Shield, Languages, Wrench, MessageCircle, Phone, Bookmark, Store } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import AuthContext from '../context/AuthContext';
import { useOrders } from '../hooks/queries/useOrders';
import { useUserProfile } from '../hooks/queries/useUsers';
import { formatOrderDate } from '../utils/dateUtils';

const Profile = () => {
    const { theme, toggleTheme } = useTheme();
    const { language, setLanguage, t } = useLanguage();
    const { user: authUser, logout } = useContext(AuthContext);

    // React Query Hooks
    const { data: userProfile } = useUserProfile();
    const { data: orders = [] } = useOrders();

    // Use profile data if available, otherwise fall back to auth context user
    const user = userProfile?.data || authUser;
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Calculate real-time order statistics
    const processingOrders = orders.filter(order => order.status === 'Processing').length;
    const shippedOrders = orders.filter(order => order.status === 'Shipped').length;
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
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-xl transform transition-all">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('Sign Out')}</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            {t('Are you sure you want to sign out?')}
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                {t('Cancel')}
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                            >
                                {t('Sign Out')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                {/* Profile Header */}
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-6 flex items-center gap-4 sm:gap-6 transition-colors duration-200">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 sm:p-4 rounded-full flex-shrink-0">
                        <User size={40} className="text-blue-600 dark:text-blue-400 sm:w-12 sm:h-12" />
                    </div>
                    <div className="flex-1 min-w-0 pr-16">
                        <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white truncate">{user?.name || 'Guest User'}</h1>
                        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 truncate">{user?.email || 'Not logged in'}</p>
                    </div>

                    {/* Coin Badge - Absolute Top Right */}
                    <div className="absolute top-6 right-6 inline-flex items-center px-3 py-1.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-sm font-bold border border-yellow-200 dark:border-yellow-700">
                        <span className="mr-1.5">🪙</span>
                        {user.coins || 0}
                    </div>
                </div>

                {/* Order Dashboard */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6 transition-colors duration-200">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Package className="text-blue-600 dark:text-blue-400" size={20} />
                            {t('Orders Dashboard')}
                        </h2>
                        <Link to="/orders" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline">
                            {t('View All Orders')}
                        </Link>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{processingOrders}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-1">{t('Processing')}</p>
                            </div>
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{shippedOrders}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-1">{t('Shipped')}</p>
                            </div>
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{deliveredOrders}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-1">{t('Delivered')}</p>
                            </div>
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{cancelledOrders}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-1">{t('Cancelled')}</p>
                            </div>
                        </div>
                        <div className="mt-6">
                            {recentOrder ? (
                                <Link to={`/orders/${recentOrder._id || recentOrder.id}`} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                                            <Package className="text-gray-400 dark:text-gray-500" size={24} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{t('Track your recent order')}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                #{String(recentOrder._id || recentOrder.id).slice(-6).toUpperCase()} • {formatOrderDate(recentOrder.createdAt || recentOrder.date)}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" size={20} />
                                </Link>
                            ) : (
                                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-center">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('No orders yet')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {/* News & Offers */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6 transition-colors duration-200">
                    <Link to="/news" className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-xl">
                                <Globe className="text-pink-600 dark:text-pink-400" size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('News & Offers')}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('Check out latest deals and updates')}</p>
                            </div>
                        </div>
                        <ChevronRight className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" size={20} />
                    </Link>
                </div>

                {/* Services */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6 transition-colors duration-200">
                    <Link to="/services" className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                <Wrench className="text-purple-600 dark:text-purple-400" size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('Services')}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('Explore our additional services')}</p>
                            </div>
                        </div>
                        <ChevronRight className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" size={20} />
                    </Link>
                </div>

                {/* Admin Dashboard / My Store (Visible to Admin, Store Admin, or Specific User) */}
                {user && (user.role === 'admin' || user.role === 'store_admin' || user.email === 'mohamedinamulhasan0@gmail.com' || user.email === 'mohamedinamulhasan28052004@gmail.com') && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6 transition-colors duration-200">
                        <Link to={user.role === 'store_admin' ? '/my-store' : '/admin'} className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                    {user.role === 'store_admin' ? (
                                        <Store className="text-blue-600 dark:text-blue-400" size={24} />
                                    ) : (
                                        <Shield className="text-blue-600 dark:text-blue-400" size={24} />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                        {user.role === 'store_admin' ? t('My Store') : t('Admin Dashboard')}
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {user.role === 'store_admin' ? t('Manage your store products and details') : t('Manage products, stores, and users')}
                                    </p>
                                </div>
                            </div>
                            <ChevronRight className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" size={20} />
                        </Link>
                    </div>
                )}

                {/* Saved Products */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6 transition-colors duration-200">
                    <Link to="/saved-products" className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                <Bookmark className="text-blue-600 dark:text-blue-400 fill-current" size={24} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('Saved Products')}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('View your favorite items')}</p>
                            </div>
                        </div>
                        <ChevronRight className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" size={20} />
                    </Link>
                </div>

                {/* Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-200">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Settings className="text-gray-600 dark:text-gray-400" size={20} />
                            {t('Settings')}
                        </h2>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {/* Appearance Toggle */}
                        <div className="p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer" onClick={toggleTheme}>
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    {theme === 'dark' ? (
                                        <Moon className="text-purple-600 dark:text-purple-400" size={20} />
                                    ) : (
                                        <Sun className="text-purple-600 dark:text-purple-400" size={20} />
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">{t('Appearance')}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {theme === 'dark' ? t('Dark Mode') : t('Light Mode')}
                                    </p>
                                </div>
                            </div>
                            <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 bg-gray-200 dark:bg-purple-600">
                                <span
                                    className={`${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                />
                            </div>
                        </div>

                        {/* Saved Products Link */}

                    </div>




                    <div className="p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer text-red-600 dark:text-red-400" onClick={handleLogout}>
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <LogOut className="text-red-600 dark:text-red-400" size={20} />
                            </div>
                            <p className="font-medium">{t('Sign Out')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating WhatsApp Button */}
            <a
                href="https://wa.me/919500171980"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-32 md:bottom-6 right-6 p-4 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-50 flex items-center justify-center"
                aria-label="Chat on WhatsApp"
            >
                <svg
                    viewBox="0 0 24 24"
                    width="28"
                    height="28"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
            </a>
        </div>
    );
};

export default Profile;
