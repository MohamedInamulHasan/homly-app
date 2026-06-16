import React, { useState, useRef, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Bookmark, Store } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { API_BASE_URL } from '../utils/api';
import { isStoreOpen, getStoreName } from '../utils/storeHelpers';

import { useData } from '../context/DataContext';

const ProductCard = ({ product, showCartControls = true, showHeart = false, stores: propStores }) => {
    const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();
    const { stores: contextStores, savedProducts, toggleSaveProduct } = useData();
    const { t, language } = useLanguage();
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



    // Auto-cycling variants logic (for Group cards)
    const [currentVariantIndex, setCurrentVariantIndex] = useState(0);
    const variants = product.variants || [];
    const isGroup = product.isGroup && variants.length > 0;

    useEffect(() => {
        if (!isGroup) return;
        const interval = setInterval(() => {
            setCurrentVariantIndex(prev => (prev + 1) % variants.length);
        }, 10000); // Cycle every 10 seconds
        return () => clearInterval(interval);
    }, [isGroup, variants.length]);

    const featuredVariant = isGroup ? variants[currentVariantIndex] : product;

    return (
        <div className={`relative flex flex-col h-full bg-white dark:bg-gray-800 rounded-3xl overflow-hidden group transition-all duration-300`}>
            
            <Link 
                to={(!isOpen || !isAvailable) ? '#' : (product.isGroup ? `/product-group/${encodeURIComponent(product.title)}` : `/product/${productId}`)} 
                className={`flex-1 ${(!isOpen || !isAvailable) ? 'cursor-default' : ''}`}
                onClick={(e) => {
                    if (!isOpen || !isAvailable) {
                        e.preventDefault();
                    }
                }}
            >
                {/* Badges Section */}
                <div className="absolute top-3 left-3 z-[15] pointer-events-none flex flex-col gap-1.5 items-start">
                    {product.isGold && (
                        <div className="bg-[#16A34A] text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                            {t('Free Delivery')}
                        </div>
                    )}
                    {product.isFromAd && (
                        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-[9px] font-bold px-2.5 py-1 rounded-full">
                            Offer
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
                <div className={`aspect-square bg-[#F9FAFB] m-1 rounded-2xl overflow-hidden flex items-center justify-center relative ${!isOpen || !isAvailable ? 'opacity-60' : ''}`}>
                    {showHeart && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleSaveProduct(product);
                            }}
                             className={`absolute top-2 right-2 z-[25] p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-sm transition-all active:scale-90 ${isSaved ? 'text-[#FF5C5C]' : 'text-gray-400'}`}
                        >
                            <Bookmark 
                                size={18} 
                                fill={isSaved ? "currentColor" : "none"} 
                                className={isSaved ? "fill-current" : ""}
                            />
                        </button>
                    )}
                    <img
                        key={featuredVariant.image || currentVariantIndex} // Force new element per variant for animation
                        src={featuredVariant.image || `${API_BASE_URL}/products/${productId}/image`}
                        alt={t(featuredVariant, 'title')}
                        className={`w-full h-full object-cover transition-transform duration-300 ${isAvailable && isOpen ? 'group-hover:scale-110' : ''}`}
                        loading="lazy"
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://atlas-content-cdn.pixelbin.io/ast/feed_v2/static_assets/common/vegetable_placeholder.png'; }}
                    />
                </div>

                {/* Content Section */}
                <div className="px-3.5 pb-4 pt-1 flex flex-col items-start flex-1 min-w-0 transition-opacity duration-300">
                    <div className="flex-1 min-h-[42px] mb-1 w-full flex flex-col justify-center transition-opacity duration-300">
                        {(() => {
                            const fullTitle = t(featuredVariant, 'title');
                            let mainTitle = fullTitle;
                            let bracketText = null;

                            const bracketIndex = fullTitle.indexOf('(');
                            if (bracketIndex !== -1) {
                                const part1 = fullTitle.substring(0, bracketIndex).trim();
                                const part2 = fullTitle.substring(bracketIndex + 1, fullTitle.length - 1).trim();
                                
                                const isPart1Tamil = /[\u0B80-\u0BFF]/.test(part1);
                                const isPart2Tamil = /[\u0B80-\u0BFF]/.test(part2);
                                
                                let tamStr = '';
                                let engStr = '';
                                
                                if (isPart1Tamil && !isPart2Tamil) {
                                    tamStr = part1;
                                    engStr = part2;
                                } else if (isPart2Tamil && !isPart1Tamil) {
                                    tamStr = part2;
                                    engStr = part1;
                                } else {
                                    engStr = part1;
                                    tamStr = part2;
                                }

                                if (language === 'ta') {
                                    mainTitle = tamStr || engStr;
                                    bracketText = tamStr && engStr ? `(${engStr})` : null;
                                } else {
                                    mainTitle = engStr || tamStr;
                                    bracketText = engStr && tamStr ? `(${tamStr})` : null;
                                }
                            }
                            
                            return (
                                <>
                                    <h3 className="text-sm font-semibold text-gray-800 dark:text-white truncate w-full">
                                        {mainTitle}
                                    </h3>
                                    {bracketText && (
                                        <p className="text-sm font-semibold text-gray-800 dark:text-white truncate w-full opacity-80">
                                            {bracketText}
                                        </p>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium truncate mb-2 w-full">
                       {getStoreName(product.storeId, stores) || "ILY mart Direct"}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2 w-full">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                                {product.isGroup ? (
                                    <span className="text-base font-bold text-gray-900 dark:text-white">
                                        {Number(product.minPrice) === Number(product.maxPrice)
                                            ? `₹${Number(product.minPrice).toFixed(0)}`
                                            : `₹${Number(product.minPrice).toFixed(0)} - ₹${Number(product.maxPrice).toFixed(0)}`
                                        }
                                    </span>
                                ) : (
                                    <>
                                        <span className="text-base font-bold text-gray-900 dark:text-white">
                                            ₹{Number(product.price).toFixed(0)}
                                        </span>
                                    </>
                                )}
                            </div>
                            {(product.isGroup || product.unit) && (
                                <span className="text-[10px] text-gray-400 font-medium">
                                    {product.isGroup ? `${product.variantExtraCount + 1} ${t('options')}` : product.unit}
                                </span>
                            )}
                        </div>

                        {showCartControls && !product.isGroup && (
                            quantity > 0 ? (
                                <div 
                                    className="flex items-center gap-1 bg-gray-100/80 dark:bg-gray-700/80 p-0.5 rounded-2xl shadow-sm"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                >
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (!user) { navigate('/login'); return; }
                                            if (quantity > 1) {
                                                updateQuantity(productId, quantity - 1);
                                            } else {
                                                removeFromCart(productId);
                                            }
                                        }}
                                        className="w-8 h-9 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="font-bold text-sm min-w-[20px] text-center select-none text-[#2E5A2E] dark:text-[#CBF9B2]">{quantity}</span>
                                    <button 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            if (!user) { navigate('/login'); return; }
                                            updateQuantity(productId, quantity + 1);
                                        }}
                                        className="w-8 h-9 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-[#2E5A2E] dark:hover:text-[#CBF9B2] transition-colors"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        if (!user) { navigate('/login'); return; }
                                        addToCart(product);
                                    }}
                                     className="w-10 h-10 bg-[#2E5A2E] dark:bg-[#CBF9B2] hover:opacity-90 text-white dark:text-gray-900 rounded-full flex items-center justify-center transition-all active:scale-90 select-none"
                                    disabled={!isAvailable || !isOpen}
                                >
                                    <ShoppingCart size={18} />
                                </button>
                            )
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default ProductCard;
