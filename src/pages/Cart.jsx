import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Store, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useUserProfile } from '../hooks/queries/useUsers';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { getStoreName } from '../utils/storeHelpers';
import { API_BASE_URL } from '../utils/api';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
    const { user } = useAuth();
    const { data: userProfile } = useUserProfile(); // Fetch fresh user data with coins
    const { t } = useLanguage();
    const { stores } = useData();

    // Use userProfile for fresh coin data, fallback to user from auth
    const currentUser = userProfile?.data || user;
    const hasCoins = currentUser?.coins > 0;
    const hasGoldProduct = cartItems.some(item => item.isGold);
    const deliveryCharge = (hasCoins || hasGoldProduct) ? 0 : 20;
    const finalTotal = cartTotal + deliveryCharge;

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                <div className="bg-gradient-to-tr from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 p-8 rounded-full mb-8 shadow-xl animate-pulse-slow">
                    <ShoppingBag className="h-16 w-16 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3 text-center">
                    {t('Your cart is empty')}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 text-center max-w-md text-lg leading-relaxed">
                    {t('Looks like you haven\'t added anything to your cart yet.')}
                    <br />
                    {t('Explore our products and find something you love.')}
                </p>
                <Link
                    to="/store"
                    className="inline-flex items-center px-8 py-3.5 border border-transparent text-base font-bold rounded-full text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-500 dark:hover:to-indigo-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-1"
                >
                    {t('Start Shopping')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <ShoppingBag className="text-blue-600 dark:text-blue-400 h-6 w-6" />
                    </div>
                    {t('Cart')}
                    <span className="text-lg font-medium text-gray-500 dark:text-gray-400 ml-2 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                        {cartItems.length} {t('items')}
                    </span>
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items List */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.id} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 p-4 sm:p-5 flex gap-5 transition-all duration-300 transform hover:-translate-y-0.5">
                                <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 relative group-hover:shadow-inner transition-shadow">
                                    <img
                                        src={item.image || `${API_BASE_URL}/products/${item.id}/image`}
                                        alt={item.title}
                                        className="h-full w-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/100x100?text=No+Image'; }}
                                    />
                                    {/* Status Tags */}
                                    <div className="absolute top-0 left-0 flex flex-col items-start gap-0 z-10">
                                        {item.isGold && (
                                            <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-br-lg shadow-sm mb-[1px]">
                                                Gold Benefit
                                            </span>
                                        )}
                                        {item.isFromAd && (
                                            <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-br-lg shadow-sm">
                                                Special Offer
                                            </span>
                                        )}
                                    </div>
                                    {(() => {
                                        const unitText = item.unit;
                                        if (!unitText) return null;
                                        return (
                                            <div className="absolute bottom-0 right-0 bg-gray-900/90 backdrop-blur-md px-2.5 py-1 rounded-tl-xl z-10 pointer-events-none shadow-lg">
                                                <span className="text-[10px] font-bold text-white leading-none block uppercase tracking-wider">
                                                    {unitText}
                                                </span>
                                            </div>
                                        );
                                    })()}
                                </div>

                                <div className="flex flex-1 flex-col min-w-0 py-1">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0 pr-4">
                                            {(() => {
                                                const fullTitle = t(item, 'title') || item.title || item.name || t('Product');
                                                const bracketIndex = fullTitle.indexOf('(');

                                                if (bracketIndex !== -1) {
                                                    const mainTitle = fullTitle.substring(0, bracketIndex).trim();
                                                    const bracketText = fullTitle.substring(bracketIndex).trim();

                                                    return (
                                                        <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                                                            <Link to={`/product/${item.id}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                                                <div className="truncate" title={mainTitle}>{mainTitle}</div>
                                                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate mt-1" title={bracketText}>{bracketText}</div>
                                                            </Link>
                                                        </h3>
                                                    );
                                                }

                                                return (
                                                    <h3 className="text-base font-bold text-gray-900 dark:text-white truncate leading-tight" title={fullTitle}>
                                                        <Link to={`/product/${item.id}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                                            {fullTitle}
                                                        </Link>
                                                    </h3>
                                                );
                                            })()}
                                            {item.storeId && (
                                                <div className="flex items-center gap-1.5 mt-2">
                                                    <Store size={14} className="text-blue-500 dark:text-blue-400 flex-shrink-0" />
                                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">
                                                        {getStoreName(item.storeId, stores)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">₹{(item.price * item.quantity).toFixed(0)}</p>
                                    </div>

                                    <div className="flex flex-1 items-end justify-between mt-4">
                                        <div className="inline-flex items-center h-9 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-1 shadow-sm">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="w-7 h-7 flex items-center justify-center rounded-full bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 shadow-sm transition-all focus:outline-none active:scale-95"
                                            >
                                                <Minus size={14} strokeWidth={2.5} />
                                            </button>
                                            <span className="font-bold text-gray-900 dark:text-gray-100 text-sm w-8 text-center tabular-nums select-none">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition-all focus:outline-none active:scale-95"
                                            >
                                                <Plus size={14} strokeWidth={2.5} />
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => removeFromCart(item.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all duration-200"
                                            title={t('Remove item')}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 sticky top-24 transition-all duration-200 overflow-hidden relative">
                            {/* Decorative gradient top border */}
                            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 pt-2">{t('Order Summary')}</h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('Subtotal')}</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">₹{cartTotal.toFixed(0)}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('Delivery Charge')}</p>
                                    {(hasCoins || hasGoldProduct) ? (
                                        <div className="text-right">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                FREE
                                            </span>
                                            {hasGoldProduct ? (
                                                <p className="text-[10px] text-yellow-600 dark:text-yellow-400 flex items-center justify-end gap-1 mt-0.5 font-bold">
                                                    <span>⚡</span> Gold Member Benefit
                                                </p>
                                            ) : (
                                                <p className="text-[10px] text-yellow-600 dark:text-yellow-500 flex items-center justify-end gap-1 mt-0.5 font-medium">
                                                    <span>🪙</span> Coin Applied
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">₹{deliveryCharge}</p>
                                    )}
                                </div>

                                <div className="border-t border-dashed border-gray-200 dark:border-gray-700 pt-4 mt-2 flex items-center justify-between">
                                    <p className="text-base font-bold text-gray-900 dark:text-white">{t('Total')}</p>
                                    <p className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">₹{finalTotal.toFixed(0)}</p>
                                </div>
                            </div>

                            <Link
                                to="/checkout"
                                className="mt-8 w-full flex items-center justify-center px-6 py-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-1"
                            >
                                {t('Proceed to Checkout')}
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>

                            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                                <Lock size={12} />
                                Secure Checkout
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
