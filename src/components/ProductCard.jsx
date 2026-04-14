import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Bookmark, Store } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { API_BASE_URL } from '../utils/api';
import { isStoreOpen, getStoreName } from '../utils/storeHelpers';

import { useData } from '../context/DataContext';

const ProductCard = ({ product, showCartControls = true, showHeart = true, stores: propStores }) => {
    const { addToCart, cartItems, updateQuantity, savedProducts, toggleSaveProduct } = useCart();
    const { stores: contextStores } = useData();
    const { t } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();

    const productId = product._id || product.id;
    const cartItem = cartItems.find(item => item.id === productId);
    const quantity = cartItem?.quantity || 0;
    const isSaved = savedProducts?.some(p => (p._id || p.id || p) === productId);

    // Store logic - Use context as primary source if props are missing
    const stores = propStores || contextStores || []; 
    const storeToUse = product.storeId?._id 
        ? product.storeId 
        : (stores.find(s => (s._id || s.id) === product.storeId) || product.storeId);
    
    const isOpen = product.isGroup 
        ? (storeToUse?._id ? isStoreOpen(storeToUse) : (product.anyStoreOpen ?? true)) 
        : isStoreOpen(storeToUse);
    const isAvailable = product.isGroup ? true : product.isAvailable !== false;

    // Timer refs for long press decrement
    const timerRef = useRef(null);
    const isLongPressRef = useRef(false);

    const handlePressStart = (e) => {
        if (!isAvailable || !isOpen) return;
        e.preventDefault();
        e.stopPropagation();
        isLongPressRef.current = false;
        timerRef.current = setTimeout(() => {
            isLongPressRef.current = true;
            if (quantity > 0) {
                if (!user) {
                    navigate('/login');
                    return;
                }
                updateQuantity(productId, quantity - 1);
            }
        }, 600); // 600ms hold to reduce
    };

    const handlePressEnd = (e) => {
        if (!isAvailable || !isOpen) return;
        e.preventDefault();
        e.stopPropagation();
        clearTimeout(timerRef.current);
        if (!isLongPressRef.current) {
            if (!user) {
                navigate('/login');
                return;
            }
            if (quantity === 0) {
                addToCart(product);
            } else {
                updateQuantity(productId, quantity + 1);
            }
        }
    };

    // Auto-cycling variants logic (for Group cards)
    const [currentVariantIndex, setCurrentVariantIndex] = useState(0);
    const variants = product.variants || [];
    const isGroup = product.isGroup && variants.length > 0;

    useEffect(() => {
        if (!isGroup) return;
        const interval = setInterval(() => {
            setCurrentVariantIndex(prev => (prev + 1) % variants.length);
        }, 3000); // Cycle every 3 seconds
        return () => clearInterval(interval);
    }, [isGroup, variants.length]);

    const featuredVariant = isGroup ? variants[currentVariantIndex] : product;

    return (
        <div className={`relative flex flex-col h-full bg-white dark:bg-gray-800 rounded-3xl overflow-hidden group transition-all duration-300 ${!isOpen || !isAvailable ? 'opacity-80' : ''}`}>
            
            <Link to={product.isGroup ? `/product-group/${encodeURIComponent(product.title)}` : `/product/${productId}`} className="flex-1">
                {/* Badges Section */}
                <div className="absolute top-3 left-3 z-[15] pointer-events-none flex flex-col gap-1.5 items-start">
                    {product.isGold && (
                        <div className="bg-[#16A34A] text-white text-[9px] font-bold px-2.5 py-1 rounded-full">
                            Free
                        </div>
                    )}
                    {product.isFromAd && (
                        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[9px] font-bold px-2.5 py-1 rounded-full">
                            Offer
                        </div>
                    )}
                    {!product.isGold && (
                        <div className="bg-[#FF5C5C] text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                            10% off
                        </div>
                    )}
                </div>



                {/* Status Overlays */}
                {!isAvailable && (
                    <div className="absolute inset-0 z-20 bg-black/5 flex items-center justify-center backdrop-blur-[1px]">
                        <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
                            {t('Out of Stock')}
                        </span>
                    </div>
                )}
                {!isOpen && isAvailable && (
                    <div className="absolute inset-0 z-20 bg-black/10 flex items-center justify-center backdrop-blur-[1px]">
                        <span className="bg-gray-800 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
                            {t('Closed')}
                        </span>
                    </div>
                )}

                {/* Image Container (Full Bleed) */}
                <div className="aspect-square bg-[#F9FAFB] m-1 rounded-2xl overflow-hidden flex items-center justify-center">
                    <img
                        key={featuredVariant.image || currentVariantIndex} // Force new element per variant for animation
                        src={featuredVariant.image || `${API_BASE_URL}/products/${featuredVariant._id || featuredVariant.id}/image`}
                        alt={t(featuredVariant, 'title')}
                        className={`w-full h-full object-cover transition-all duration-700 animate-in fade-in zoom-in-95 ${isAvailable && isOpen ? 'group-hover:scale-110' : ''}`}
                        loading="lazy"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://atlas-content-cdn.pixelbin.io/ast/feed_v2/static_assets/common/vegetable_placeholder.png'; }}
                    />
                </div>

                {/* Content Section */}
                <div className="p-3 bg-white dark:bg-gray-800 flex flex-col flex-1 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex-1 min-h-[42px] mb-1 w-full flex flex-col justify-center transition-opacity duration-300">
                        {(() => {
                            const fullTitle = t(featuredVariant, 'title');
                            const bracketIndex = fullTitle.indexOf('(');
                            
                            if (bracketIndex !== -1) {
                                const mainTitle = fullTitle.substring(0, bracketIndex).trim();
                                const bracketText = fullTitle.substring(bracketIndex).trim();
                                return (
                                    <>
                                        <h3 className="text-sm font-semibold text-gray-800 dark:text-white truncate w-full">
                                            {mainTitle}
                                        </h3>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-white truncate w-full">
                                            {bracketText}
                                        </p>
                                    </>
                                );
                            }
                            
                            return (
                                <h3 className="text-sm font-semibold text-gray-800 dark:text-white line-clamp-2 w-full">
                                    {fullTitle}
                                </h3>
                            );
                        })()}
                    </div>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium truncate mb-2 w-full">
                       {getStoreName(product.storeId, stores) || "Homly Direct"}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2 w-full">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                                {product.isGroup ? (
                                    <span className="text-base font-bold text-gray-900 dark:text-white">
                                        ₹{Number(product.minPrice).toFixed(0)} - ₹{Number(product.maxPrice).toFixed(0)}
                                    </span>
                                ) : (
                                    <>
                                        <span className="text-base font-bold text-gray-900 dark:text-white">
                                            ₹{Number(product.price).toFixed(0)}
                                        </span>
                                        <span className="text-[11px] text-gray-400 line-through">
                                            ₹{Math.round(Number(product.price) * 1.2)}
                                        </span>
                                    </>
                                )}
                            </div>
                            <span className="text-[10px] text-gray-400 font-medium">
                                {product.isGroup ? `${product.variantExtraCount + 1} ${t('options')}` : (product.unit || "Unit")}
                            </span>
                        </div>

                        {showCartControls && !product.isGroup && (
                            <button 
                                onPointerDown={handlePressStart}
                                onPointerUp={handlePressEnd}
                                onPointerLeave={() => clearTimeout(timerRef.current)}
                                onContextMenu={(e) => e.preventDefault()}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                className={`w-10 h-10 bg-[#2E5A2E] hover:opacity-90 text-white rounded-full flex items-center justify-center transition-all active:scale-90 select-none`}
                                disabled={!isAvailable || !isOpen}
                            >
                                {quantity > 0 ? (
                                    <span className="text-sm font-bold">{quantity}</span>
                                ) : (
                                    <ShoppingCart size={18} />
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default ProductCard;
