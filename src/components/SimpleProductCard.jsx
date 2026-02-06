import { Plus, Minus, Store, ShoppingCart, Zap, Bookmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { API_BASE_URL } from '../utils/api';
import { isStoreOpen } from '../utils/storeHelpers';
import { useState } from 'react';

const SimpleProductCard = ({ product, isFastPurchase, stores: propStores }) => {
    const { t } = useLanguage();
    const { stores: contextStores, savedProducts, toggleSaveProduct } = useData();
    const stores = propStores || contextStores;
    const { cartItems, addToCart, removeFromCart, updateQuantity } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const productId = product._id || product.id;
    const [showQuantity, setShowQuantity] = useState(false);

    // Check if saved
    const isSaved = savedProducts?.some(p => (p._id || p.id || p) === productId);

    const handleToggleSave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSaveProduct(productId);
    };

    // Look up store name from stores context
    const storeIdStr = product.storeId?._id || product.storeId;
    const store = stores?.find(s => (s._id || s.id) === storeIdStr);
    const storeName = store?.name || product.storeId?.name || 'Unknown Store';

    // Get cart quantity for this product
    const cartItem = cartItems.find(item => item.id === productId);
    const cartQuantity = cartItem ? cartItem.quantity : 0;

    // Check if store is open
    const isStoreOpenCheck = store ? isStoreOpen(store) : true;

    const handleClick = (e) => {
        if (!isStoreOpenCheck) {
            e.preventDefault();
            alert(t('This store is currently closed.'));
        }
    };

    const handleFastPurchaseClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            navigate('/login');
            return;
        }

        if (!isAvailable || !isStoreOpenCheck) return;

        if (cartQuantity > 0) {
            // If already in cart, show quantity controls
            setShowQuantity(true);
        } else {
            // Add to cart with quantity 1
            addToCart({
                id: productId,
                title: product.title,
                price: product.price,
                image: product.image,
                storeId: product.storeId,
                quantity: 1,
                isGold: product.isGold // Pass isGold status
            });
            setShowQuantity(true);
        }
    };

    const handleIncrement = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            navigate('/login');
            return;
        }
        if (cartQuantity > 0) {
            updateQuantity(productId, cartQuantity + 1);
        } else {
            addToCart({
                id: productId,
                title: product.title,
                price: product.price,
                image: product.image,
                storeId: product.storeId,
                quantity: 1,
                isGold: product.isGold
            });
        }
    };

    const handleDecrement = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            navigate('/login');
            return;
        }
        if (cartQuantity > 1) {
            updateQuantity(productId, cartQuantity - 1);
        } else if (cartQuantity === 1) {
            removeFromCart(productId);
            setShowQuantity(false);
        }
    };

    // Handle Grouped Products
    if (product.isGroup) {
        return (
            <Link
                to={`/product-group/${encodeURIComponent(product.title)}${isFastPurchase ? '?fast=true' : ''}`}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 flex flex-col h-full border border-gray-100 dark:border-gray-700 ${product.anyStoreOpen ? 'hover:shadow-2xl hover:scale-[1.02]' : 'opacity-75 grayscale-[0.5]'}`}
            >
                <div className="relative pb-[100%] overflow-hidden bg-white">
                    <img
                        src={product.image || `${API_BASE_URL}/products/${product._id.replace('group-', '')}/image`}
                        alt={t(product, 'title')}
                        loading="lazy"
                        className={`absolute top-0 left-0 w-full h-full object-contain transition-transform duration-300 ${isStoreOpenCheck || product.anyStoreOpen ? 'hover:scale-105' : 'grayscale'}`}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300?text=No+Image'; }}
                    />
                    {/* Show Closed Overlay for Group ONLY if ALL stores are closed */}
                    {product.isGroup && !product.anyStoreOpen && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transform -rotate-12 border-2 border-white">
                                {t('STORE CLOSED')}
                            </span>
                        </div>
                    )}
                </div>
                <div className="p-3 flex flex-col justify-between flex-1">
                    <div>
                        {(() => {
                            const fullTitle = t(product, 'title');
                            const bracketIndex = fullTitle.indexOf('(');
                            let mainTitle = fullTitle;
                            let bracketContent = '';

                            if (bracketIndex !== -1) {
                                mainTitle = fullTitle.substring(0, bracketIndex).trim();
                                bracketContent = fullTitle.substring(bracketIndex).trim();
                            }

                            // Dynamic sizing logic
                            const isMainTitleLong = mainTitle.length > 20;
                            const isBracketLong = bracketContent.length > 20;

                            return (
                                <div className="mb-1">
                                    <h3 className={`${isMainTitleLong ? 'text-xs md:text-sm' : 'text-sm md:text-base'} font-semibold text-gray-800 dark:text-white leading-tight truncate`}>
                                        {mainTitle}
                                    </h3>
                                    {bracketContent && (
                                        <span className={`block ${isBracketLong ? 'text-[10px]' : 'text-xs'} text-gray-500 dark:text-gray-400 font-medium mt-0.5 truncate`}>
                                            {bracketContent}
                                        </span>
                                    )}
                                </div>
                            );
                        })()}
                        {/* Store Name - Consistent with Single Product */}
                        <div className="flex items-center gap-1 mb-2">
                            <Store size={12} className={`${!product.anyStoreOpen ? 'text-gray-400' : 'text-blue-600 dark:text-blue-400'} flex-shrink-0`} />
                            <p className={`text-xs ${!product.anyStoreOpen ? 'text-gray-400' : 'text-blue-600 dark:text-blue-400'} font-bold truncate`}>
                                +{product.storeCount} {t('options')}
                            </p>
                        </div>
                    </div>

                    <span className={`text-lg font-bold ${!product.anyStoreOpen ? 'text-gray-400' : (product.isGold ? 'text-slate-800' : 'text-blue-600 dark:text-blue-400')}`}>
                        {(() => {
                            // Robust Price Logic
                            if (product.minPrice !== undefined && product.maxPrice !== undefined && product.minPrice !== product.maxPrice) {
                                return `₹${Number(product.minPrice).toFixed(0)} - ₹${Number(product.maxPrice).toFixed(0)}`;
                            }
                            // Fallback: Check variants if available locally
                            if (product.variants && product.variants.length > 0) {
                                const prices = product.variants.map(v => v.price).filter(p => p !== undefined);
                                if (prices.length > 0) {
                                    const min = Math.min(...prices);
                                    const max = Math.max(...prices);
                                    if (min !== max) {
                                        return `₹${min.toFixed(0)} - ₹${max.toFixed(0)}`;
                                    }
                                    return `₹${min.toFixed(0)}`;
                                }
                            }
                            // Default Fallback
                            return `₹${Number(product.price || 0).toFixed(0)}`;
                        })()}
                    </span>

                    {/* Fake Add Button for Visual Consistency - Clickable as part of the Link */}
                    {isFastPurchase && (
                        <div className="mt-2">
                            {!product.anyStoreOpen ? (
                                <div
                                    className="w-full h-10 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 transition-colors border border-gray-200 dark:border-gray-600"
                                >
                                    <span className="text-gray-400 text-xs font-bold uppercase">{t('VIEW')}</span>
                                </div>
                            ) : (
                                <div
                                    className="w-full h-10 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg px-3 transition-colors cursor-pointer shadow-md hover:shadow-lg"
                                >
                                    <span className="text-white text-xs font-bold uppercase">{t('VIEW')}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Link >
        );
    }

    const isAvailable = product.isAvailable !== false; // Default to true

    if (!isAvailable) return null; // Hide if unavailable

    return (
        <Link
            to={(isStoreOpenCheck && isAvailable) ? `/product/${productId}` : '#'}
            onClick={(e) => {
                if (!isAvailable) {
                    e.preventDefault();
                    // Optional: Alert or just do nothing
                    return;
                }
                handleClick(e);
            }}
            className={`rounded-2xl overflow-hidden transition-all duration-300 flex flex-col h-full ${product.isGold
                ? 'bg-gradient-to-br from-yellow-300 via-yellow-100 to-yellow-400 dark:from-yellow-600 dark:via-yellow-400 dark:to-yellow-700 shadow-[0_0_15px_rgba(250,204,21,0.3)] hover:shadow-[0_0_25px_rgba(250,204,21,0.5)] border border-yellow-400 dark:border-yellow-500 transform hover:-translate-y-1'
                : 'bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700'} ${isStoreOpenCheck && isAvailable ? 'hover:shadow-2xl hover:scale-[1.02]' : 'opacity-75 grayscale-[0.5] cursor-not-allowed'
                }`}
        >
            <div className={`relative pb-[100%] overflow-hidden ${product.isGold ? 'bg-transparent' : 'bg-white'}`}>
                <img
                    src={product.image || `${API_BASE_URL}/products/${productId}/image`}
                    alt={t(product, 'title')}
                    loading="lazy"
                    className={`absolute top-0 left-0 w-full h-full object-contain transition-transform duration-300 ${isStoreOpenCheck && isAvailable ? 'group-hover:scale-105' : 'grayscale'}`}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300?text=No+Image'; }}
                />
                {/* Subtle gradient overlay for depth */}
                {isStoreOpenCheck && isAvailable && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                )}
                {!isStoreOpenCheck && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                        <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transform -rotate-12 border-2 border-white">
                            {t('STORE CLOSED')}
                        </span>
                    </div>
                )}
                {!isAvailable && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                        <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transform -rotate-12 border-2 border-white">
                            {t('OUT OF STOCK')}
                        </span>
                    </div>
                )}
                {/* Cart Quantity Badge - Moved to Left */}
                {cartQuantity > 0 && isStoreOpenCheck && isAvailable && (
                    <div className={`absolute top-2 left-2 text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg flex items-center gap-1 z-20 ${product.isGold
                        ? 'bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600'
                        : 'bg-gradient-to-br from-blue-600 to-indigo-600'
                        }`}>
                        <ShoppingCart size={12} />
                        {cartQuantity}
                    </div>
                )}

                {/* Save Button - Top Right */}
                <button
                    onClick={handleToggleSave}
                    className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors shadow-sm z-20 ${product.isGold
                        ? 'bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 border border-slate-600'
                        : 'bg-white/80 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60'
                        }`}
                >
                    <Bookmark
                        size={16}
                        className={`${isSaved
                            ? (product.isGold ? 'text-yellow-400 fill-current' : 'text-blue-600 fill-current')
                            : (product.isGold ? 'text-slate-400 hover:text-white' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400')
                            }`}
                    />
                </button>

                {/* Unit Tag */}
                {product.unit && (
                    <div className="absolute bottom-0 right-0 bg-gray-900/80 backdrop-blur-sm px-2 py-1 rounded-tl-lg z-10 pointer-events-none">
                        <span className="text-[10px] font-bold text-white leading-none block">
                            {product.unit}
                        </span>
                    </div>
                )}
            </div>
            <div className="p-3 flex flex-col justify-between flex-1">
                <div>
                    {(() => {
                        const fullTitle = t(product, 'title');
                        const bracketIndex = fullTitle.indexOf('(');
                        let mainTitle = fullTitle;
                        let bracketContent = '';

                        if (bracketIndex !== -1) {
                            mainTitle = fullTitle.substring(0, bracketIndex).trim();
                            bracketContent = fullTitle.substring(bracketIndex).trim();
                        }

                        // Dynamic sizing logic
                        const isMainTitleLong = mainTitle.length > 20;
                        const isBracketLong = bracketContent.length > 20;

                        return (
                            <div className="mb-1">
                                <h3 className={`${isMainTitleLong ? 'text-xs md:text-sm' : 'text-sm md:text-base'} font-semibold ${product.isGold ? 'text-slate-800' : 'text-gray-800 dark:text-white'} leading-tight truncate`}>
                                    {mainTitle}
                                </h3>
                                {bracketContent && (
                                    <span className={`block ${isBracketLong ? 'text-[10px]' : 'text-xs'} ${product.isGold ? 'text-slate-600' : 'text-gray-500 dark:text-gray-400'} font-medium mt-0.5 truncate`}>
                                        {bracketContent}
                                    </span>
                                )}
                            </div>
                        );
                    })()}
                    {product.storeId && (
                        <div className="flex items-center gap-1 mb-2">
                            <Store size={12} className={`${product.isGold ? 'text-slate-500' : 'text-gray-400 dark:text-gray-500'} flex-shrink-0`} />
                            <p className={`text-xs ${product.isGold ? 'text-slate-600' : 'text-gray-500 dark:text-gray-400'} truncate`}>
                                {storeName}
                            </p>
                        </div>
                    )}
                </div>
                <span className={`text-lg font-bold ${!isStoreOpenCheck || !isAvailable ? 'text-gray-400' : (product.isGold ? 'text-slate-800' : 'text-blue-600 dark:text-blue-400')}`}>
                    ₹{Number(product.price || 0).toFixed(0)}
                </span>

                {isFastPurchase && isAvailable && (
                    <div className="mt-2" onClick={(e) => e.preventDefault()}>
                        {!isStoreOpenCheck ? (
                            <button
                                disabled
                                className="w-full h-10 flex items-center justify-center gap-2 rounded-lg px-3 transition-colors bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed border border-gray-200 dark:border-gray-600"
                            >
                                <Plus size={16} className="text-gray-400" />
                                <span className="text-gray-400 text-xs font-bold uppercase">{t('Add')}</span>
                            </button>
                        ) : cartQuantity > 0 ? (
                            <div className={`flex items-center justify-between h-10 rounded-xl p-1 ${product.isGold ? 'bg-white/60 border border-slate-200' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                <button
                                    onClick={handleDecrement}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg shadow-sm transition-colors ${product.isGold ? 'bg-white text-slate-700 hover:text-red-600 border border-slate-100' : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:text-red-600 border border-gray-100 dark:border-gray-500'}`}
                                >
                                    <Minus size={16} strokeWidth={2.5} />
                                </button>
                                <span className={`font-bold text-base flex-1 text-center tabular-nums ${product.isGold ? 'text-slate-800' : 'text-gray-900 dark:text-white'}`}>
                                    {cartQuantity}
                                </span>
                                <button
                                    onClick={handleIncrement}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg shadow-sm transition-colors ${product.isGold ? 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-800 hover:from-slate-300 hover:to-slate-400' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'}`}
                                >
                                    <Plus size={16} strokeWidth={2.5} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleFastPurchaseClick}
                                className={`w-full h-10 flex items-center justify-center gap-2 rounded-lg px-3 transition-colors ${product.isGold ? 'bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white shadow-md' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700'}`}
                            >
                                <Plus size={16} className={product.isGold ? 'text-slate-200' : 'text-white'} />
                                <span className={`${product.isGold ? 'text-slate-100' : 'text-white'} text-xs font-bold uppercase`}>{t('Add')}</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </Link>
    );
};

export default SimpleProductCard;
