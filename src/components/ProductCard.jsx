import { Plus, Minus, Bookmark, Store } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { getStoreName, isStoreOpen } from '../utils/storeHelpers';
import { API_BASE_URL } from '../utils/api';

const ProductCard = ({ product, showCartControls = true, showHeart = true, stores: propStores }) => {
    const { addToCart, cartItems, updateQuantity } = useCart();
    const { savedProducts, toggleSaveProduct, stores: contextStores } = useData();
    const stores = propStores || contextStores;
    const { t } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();

    const productId = product._id || product.id;
    const cartItem = cartItems.find(item => item.id === productId);
    const isSaved = savedProducts.some(p => (p._id || p.id || p) === productId);

    const handleToggleSave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSaveProduct(productId);
    };

    const isAvailable = product.isAvailable !== false; // Default to true if undefined

    // Check Store Open Status
    const storeToUse = stores?.find(s => (s._id || s.id) === (product.storeId?._id || product.storeId));
    const isStoreOpenCheck = storeToUse ? isStoreOpen(storeToUse) : true; // Default open if store not found, or strict? defaulting true to show content, but overlay wont show.

    const handleCardClick = (e) => {
        if (!isStoreOpenCheck && isAvailable) {
            e.preventDefault();
            // Optional: alert(t('Store is closed'));
        }
    };

    if (!isAvailable) return null; // Hide if unavailable


    return (
        <div className={`rounded-lg overflow-hidden transition-all duration-300 flex flex-col h-full relative group ${!isAvailable ? 'opacity-75' : ''} ${product.isGold
            ? 'bg-gradient-to-br from-yellow-300 via-yellow-100 to-yellow-400 dark:from-yellow-600 dark:via-yellow-400 dark:to-yellow-700 shadow-[0_0_15px_rgba(250,204,21,0.3)] hover:shadow-[0_0_25px_rgba(250,204,21,0.5)] border border-yellow-400 dark:border-yellow-500 transform hover:-translate-y-1'
            : 'bg-white dark:bg-gray-800 shadow-md hover:shadow-lg border border-gray-100 dark:border-gray-700'} ${!isStoreOpenCheck && isAvailable ? 'grayscale-[0.5] opacity-75 cursor-not-allowed' : ''}`}>
            <Link to={`/product/${productId}`} onClick={handleCardClick} className={`flex-1 block ${!isAvailable || !isStoreOpenCheck ? 'pointer-events-none' : ''}`}>
                <div className={`relative pb-[100%] overflow-hidden ${product.isGold ? 'bg-transparent' : 'bg-white'}`}>
                    <img
                        src={product.image || `${API_BASE_URL}/products/${productId}/image`}
                        alt={t(product, 'title')}
                        loading="lazy"
                        className={`absolute top-0 left-0 w-full h-full object-contain transform transition-transform duration-300 ${isAvailable && isStoreOpenCheck ? 'group-hover:scale-105' : 'grayscale'}`}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300?text=No+Image'; }}
                    />
                    {/* Heart Button */}
                    {showHeart && (
                        <button
                            onClick={handleToggleSave}
                            className={`absolute top-2 right-2 p-2 rounded-full transition-colors shadow-sm z-10 pointer-events-auto ${product.isGold
                                ? 'bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 border border-slate-600'
                                : 'bg-white/80 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60'
                                }`}
                        >
                            <Bookmark
                                size={18}
                                className={`${isSaved
                                    ? (product.isGold ? 'text-yellow-400 fill-current' : 'text-blue-600 fill-current')
                                    : (product.isGold ? 'text-slate-400 hover:text-white' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400')
                                    }`}
                            />
                        </button>
                    )}
                    {/* Cart Quantity Badge - Always visible if in cart */}
                    {cartItem && cartItem.quantity > 0 && (
                        <div className={`absolute top-2 left-2 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg flex items-center gap-1 z-20 pointer-events-none ${product.isGold
                            ? 'bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600'
                            : 'bg-blue-600'
                            }`}>
                            <Store size={12} className="hidden" /> {/* Hidden store icon to match height usage if needed, or use ShoppingCart */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shopping-cart"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
                            {cartItem.quantity}
                        </div>
                    )}
                    {!isAvailable && (
                        <div className="absolute inset-0 bg-black/10 flex items-center justify-center backdrop-blur-[1px]">
                            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                                {t('Out of Stock')}
                            </span>
                        </div>
                    )}
                    {!isStoreOpenCheck && isAvailable && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 backdrop-blur-[1px]">
                            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transform -rotate-12 border-2 border-white">
                                {t('STORE CLOSED')}
                            </span>
                        </div>
                    )}
                    {/* Unit Tag */}
                    {product.unit && (
                        <div className="absolute bottom-0 right-0 bg-gray-900/80 backdrop-blur-sm px-2 py-1 rounded-tl-lg z-10 pointer-events-none">
                            <span className="text-[10px] font-bold text-white leading-none block">
                                {product.unit}
                            </span>
                        </div>
                    )}
                </div>
                <div className="p-4 pb-0">
                    {(() => {
                        const fullTitle = t(product, 'title');
                        const bracketIndex = fullTitle.indexOf('(');
                        const isLongTitle = fullTitle.length > 25;

                        if (bracketIndex !== -1) {
                            const mainTitle = fullTitle.substring(0, bracketIndex).trim();
                            const bracketText = fullTitle.substring(bracketIndex).trim();

                            return (
                                <div className="mb-1">
                                    <h3 className={`font-semibold ${product.isGold ? 'text-slate-800' : 'text-gray-800 dark:text-white'} truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${isLongTitle ? 'text-sm' : 'text-base md:text-lg'}`} title={mainTitle}>
                                        {mainTitle}
                                    </h3>
                                    <p className={`text-xs ${product.isGold ? 'text-slate-600' : 'text-gray-500 dark:text-gray-400'} truncate`} title={bracketText}>
                                        {bracketText}
                                    </p>
                                </div>
                            );
                        }

                        return (
                            <h3 className={`font-semibold ${product.isGold ? 'text-slate-800' : 'text-gray-800 dark:text-white'} truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1 ${isLongTitle ? 'text-sm' : 'text-base md:text-lg'}`} title={fullTitle}>
                                {fullTitle}
                            </h3>
                        );
                    })()}
                    {product.storeId && (
                        <div className="flex items-center gap-1 mt-1">
                            <Store size={12} className={`${product.isGold ? 'text-slate-500' : 'text-gray-400 dark:text-gray-500'} flex-shrink-0`} />
                            <p className={`text-xs ${product.isGold ? 'text-slate-600' : 'text-gray-500 dark:text-gray-400'} truncate`}>
                                {getStoreName(product.storeId, stores)}
                            </p>
                        </div>
                    )}

                </div>
            </Link>
            {showCartControls && (
                <div className="p-4 pt-2 mt-auto">
                    <div className="flex flex-col gap-3">
                        <span className={`text-lg md:text-xl font-bold ${!isStoreOpenCheck ? 'text-gray-400' : (product.isGold ? 'text-slate-800' : 'text-blue-600 dark:text-blue-400')}`}>₹{Number(product.price || 0).toFixed(0)}</span>
                        {!isStoreOpenCheck ? (
                            <button
                                disabled
                                className="w-full h-10 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed flex items-center justify-center gap-2"
                                aria-label="Store closed"
                            >
                                <Plus size={20} className="text-gray-400" />
                                <span className="text-sm font-bold tracking-wide text-gray-500">{t('ADD')}</span>
                            </button>
                        ) : cartItem && cartItem.quantity > 0 ? (
                            <div className={`flex items-center justify-between h-10 rounded-xl p-1 ${product.isGold ? 'bg-white/60 border border-slate-200' : 'bg-gray-100 dark:bg-gray-700'}`} onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => {
                                        if (!user) {
                                            navigate('/login');
                                            return;
                                        }
                                        updateQuantity(productId, cartItem.quantity - 1);
                                    }}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg shadow-sm transition-all active:scale-90 ${product.isGold ? 'bg-white text-slate-700 hover:text-red-600 border border-slate-100' : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:text-red-600 border border-gray-100 dark:border-gray-500'}`}
                                    aria-label="Decrease quantity"
                                    disabled={!isAvailable}
                                >
                                    <Minus size={16} strokeWidth={3} />
                                </button>
                                <span className={`font-bold text-base flex-1 text-center tabular-nums ${product.isGold ? 'text-slate-800' : 'text-gray-900 dark:text-white'}`}>
                                    {cartItem.quantity}
                                </span>
                                <button
                                    onClick={() => {
                                        if (!user) {
                                            navigate('/login');
                                            return;
                                        }
                                        updateQuantity(productId, cartItem.quantity + 1);
                                    }}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg shadow-md hover:shadow-lg transition-all active:scale-90 ${product.isGold ? 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-800 hover:from-slate-300 hover:to-slate-400' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'}`}
                                    aria-label="Increase quantity"
                                    disabled={!isAvailable}
                                >
                                    <Plus size={16} strokeWidth={3} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    if (!user) {
                                        navigate('/login');
                                        return;
                                    }
                                    addToCart(product);
                                }}
                                disabled={!isAvailable}
                                className={`w-full h-10 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center justify-center gap-2 transform active:scale-95 ${isAvailable
                                    ? (product.isGold ? 'bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white shadow-md' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700')
                                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                                    }`}
                                aria-label={isAvailable ? "Add to cart" : "Out of stock"}
                            >
                                <Plus size={20} className={product.isGold ? 'text-slate-200' : 'text-white'} />
                                <span className={`text-sm font-bold tracking-wide ${product.isGold ? 'text-slate-100' : 'text-white'}`}>{isAvailable ? 'ADD' : 'Out of Stock'}</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
            {!showCartControls && (
                <div className="p-4 pt-2 mt-auto">
                    <span className={`text-lg md:text-xl font-bold ${!isStoreOpenCheck ? 'text-gray-400' : (product.isGold ? 'text-slate-800' : 'text-blue-600 dark:text-blue-400')}`}>₹{Number(product.price || 0).toFixed(0)}</span>
                </div>
            )}
        </div>
    );
};

export default ProductCard;
