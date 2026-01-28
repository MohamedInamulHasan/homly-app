import { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Search, ShoppingBag, ShoppingCart, LayoutDashboard, User } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const Navbar = () => {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const { cartCount, cartTotal } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isAdmin = location.pathname.startsWith('/admin');

    const handleSearch = (e) => {
        e.preventDefault();
        const searchParams = new URLSearchParams(window.location.search);
        const currentCategory = searchParams.get('category');

        let url = '/?';
        if (searchQuery.trim()) {
            url += `search=${encodeURIComponent(searchQuery)}`;
        }

        if (currentCategory) {
            url += `${searchQuery.trim() ? '&' : ''}category=${encodeURIComponent(currentCategory)}`;
        }

        if (!searchQuery.trim() && !currentCategory) {
            navigate('/');
        } else {
            navigate(url);
        }
        setIsOpen(false);
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (value.trim() === '') {
            navigate('/');
        }
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors duration-200 pt-[env(safe-area-inset-top)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="bg-blue-600 text-white p-2 rounded-xl group-hover:scale-110 transition-transform duration-300">
                            <ShoppingBag size={24} />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-600">
                            Homly
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                placeholder={t('Search products...')}
                                value={searchQuery}
                                onChange={handleInputChange}
                                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                            />
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                        </form>

                        <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">{t('Home')}</Link>
                        <Link to="/store" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">{t('Store')}</Link>
                        <Link to="/orders" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">{t('Orders')}</Link>

                        {user ? (
                            <Link to="/profile" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                                {t('Profile')}
                            </Link>
                        ) : (
                            <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">{t('Login')}</Link>
                        )}

                        {!isAdmin && (
                            <Link to="/cart" className="group transition-transform active:scale-95 hover:scale-105 duration-200">
                                {cartCount > 0 ? (
                                    <div className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 pl-3 pr-2 py-1.5 rounded-full shadow-md hover:shadow-lg transition-all">
                                        <span className="text-white font-bold text-sm">₹{cartTotal.toFixed(0)}</span>
                                        <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-sm relative">
                                            <ShoppingCart size={16} className="text-white" />
                                            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-indigo-600">
                                                {cartCount}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                        <ShoppingCart size={24} />
                                    </div>
                                )}
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        {!isAdmin && (
                            <Link to="/cart" className="group transition-transform active:scale-95 duration-200">
                                {cartCount > 0 ? (
                                    <div className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 pl-3 pr-2 py-1.5 rounded-full shadow-md">
                                        <span className="text-white font-bold text-sm">₹{cartTotal.toFixed(0)}</span>
                                        <div className="bg-white/20 p-1.5 rounded-full backdrop-blur-sm relative">
                                            <ShoppingCart size={16} className="text-white" />
                                            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border-2 border-indigo-600">
                                                {cartCount}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="relative p-2 text-gray-600 dark:text-gray-300">
                                        <ShoppingCart size={24} />
                                    </div>
                                )}
                            </Link>
                        )}
                        {/* {isAdmin && (
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                {isOpen ? <X size={24} /> : <LayoutDashboard size={24} />}
                            </button>
                        )} */}
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-lg animate-fade-in-down">
                    <div className="px-4 py-6 space-y-4">
                        <form onSubmit={handleSearch} className="relative mb-4">
                            <input
                                type="text"
                                placeholder={t('Search products...')}
                                value={searchQuery}
                                onChange={handleInputChange}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
                        </form>
                        <Link
                            to="/"
                            className="block px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            {t('Home')}
                        </Link>
                        <Link
                            to="/store"
                            className="block px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            {t('Store')}
                        </Link>
                        <Link
                            to="/orders"
                            className="block px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            {t('Orders')}
                        </Link>

                        {user ? (
                            <Link
                                to="/profile"
                                className="block px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                {t('Profile')}
                            </Link>
                        ) : (
                            <Link
                                to="/login"
                                className="block px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                {t('Login')}
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
