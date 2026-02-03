import { Plus, Minus, Store, ShoppingCart, Zap, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { API_BASE_URL } from '../utils/api';
import { isStoreOpen } from '../utils/storeHelpers';
import { useState } from 'react';

const SimpleProductCard = ({ product, isFastPurchase }) => {
    const { t } = useLanguage();
    const { stores, savedProducts, toggleSaveProduct } = useData();
    const { cartItems, addToCart, removeFromCart, updateQuantity } = useCart();
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
                quantity: 1
            });
            setShowQuantity(true);
        }
    };

    const handleIncrement = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (cartQuantity > 0) {
            updateQuantity(productId, cartQuantity + 1);
        } else {
            addToCart({
                id: productId,
                title: product.title,
                price: product.price,
                image: product.image,
                storeId: product.storeId,
                quantity: 1
            });
        }
    };

    const handleDecrement = (e) => {
        e.preventDefault();
        e.stopPropagation();
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
                        className={`absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 ${isStoreOpenCheck || product.anyStoreOpen ? 'hover:scale-105' : ''}`}
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
                            <Store size={12} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold truncate">
                                +{product.storeCount} {t('options')}
                            </p>
                        </div>
                    </div>

                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
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
                            <div
                                className="w-full h-10 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 rounded-lg px-3 transition-colors cursor-pointer"
                            >
                                <span className="text-white text-xs font-bold uppercase">{t('VIEW')}</span>
                            </div>
                        </div>
                    )}
                </div>
            </Link>
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
            className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 flex flex-col h-full border border-gray-100 dark:border-gray-700 ${isStoreOpenCheck && isAvailable ? 'hover:shadow-2xl hover:scale-[1.02]' : 'opacity-75 grayscale-[0.5] cursor-not-allowed'
                }`}
        >
            <div className="relative pb-[100%] overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                <img
                    src={product.image || `${API_BASE_URL}/products/${productId}/image`}
                    alt={t(product, 'title')}
                    loading="lazy"
                    className={`absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 ${isStoreOpenCheck && isAvailable ? 'group-hover:scale-110' : ''}`}
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
                    <div className="absolute top-2 left-2 bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-lg flex items-center gap-1 z-20">
                        <ShoppingCart size={12} />
                        {cartQuantity}
                    </div>
                )}

                {/* Save Button - Top Right */}
                <button
                    onClick={handleToggleSave}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 dark:bg-black/40 hover:bg-white dark:hover:bg-black/60 transition-colors shadow-sm z-20"
                >
                    <Bookmark
                        size={16}
                        className={`${isSaved ? 'text-blue-600 fill-current' : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'}`}
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
                                <h3 className={`${isMainTitleLong ? 'text-xs md:text-sm' : 'text-sm md:text-base'} font-semibold text-gray-800 dark:text-white leading-tight ${bracketContent ? 'truncate' : 'line-clamp-2'}`}>
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
                    {product.storeId && (
                        <div className="flex items-center gap-1 mb-2">
                            <Store size={12} className="text-gray-400 dark:text-gray-500 flex-shrink-0" />
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {storeName}
                            </p>
                        </div>
                    )}
                </div>
                <span className={`text-lg font-bold ${isStoreOpenCheck && isAvailable ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>
                    ₹{Number(product.price || 0).toFixed(0)}
                </span>

                {/* Fast Purchase Quantity Controls - Below Price */}
                {isFastPurchase && isStoreOpenCheck && isAvailable && (
                    <div className="mt-2" onClick={(e) => e.preventDefault()}>
                        {cartQuantity > 0 ? (
                            <div className="flex items-center justify-between h-10 rounded-xl bg-gray-100 dark:bg-gray-700 p-1">
                                <button
                                    onClick={handleDecrement}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-200 shadow-sm hover:text-red-500 transition-colors"
                                >
                                    <Minus size={16} strokeWidth={2.5} />
                                </button>
                                <span className="font-bold text-gray-900 dark:text-white text-base flex-1 text-center tabular-nums">
                                    {cartQuantity}
                                </span>
                                <button
                                    onClick={handleIncrement}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm hover:bg-blue-700 transition-colors"
                                >
                                    <Plus size={16} strokeWidth={2.5} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleFastPurchaseClick}
                                className="w-full h-10 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 rounded-lg px-3 transition-colors"
                            >
                                <Plus size={16} className="text-white" />
                                <span className="text-white text-xs font-bold uppercase">{t('Add')}</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </Link>
    );
};

export default SimpleProductCard;
