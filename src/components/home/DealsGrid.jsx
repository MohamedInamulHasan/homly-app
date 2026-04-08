import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { API_BASE_URL } from '../../utils/api';

const DealsGrid = ({ products = [], isLoading = false }) => {
    const { t } = useLanguage();
    const { savedProducts, toggleSaveProduct } = useCart();
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <section className="px-4 py-4 mt-2">
                <div className="flex justify-between items-center mb-6 px-1">
                    <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="aspect-[4/5] bg-gray-200 dark:bg-gray-800 rounded-3xl animate-pulse"></div>
                    ))}
                </div>
            </section>
        );
    }

    if (products.length === 0) return null;

    return (
        <section className="px-4 py-4 mt-2 mb-20">
            <div className="flex justify-between items-center mb-6 px-1">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    {t("Today's Deals")}
                </h2>
                <Link to="/store" className="text-sm font-semibold text-[#2E5A2E] dark:text-green-400 hover:opacity-80 transition-all">
                    {t('See All')}
                </Link>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                {products.map((product) => {
                    const productId = product._id || product.id;
                    const isSaved = savedProducts?.some(p => (p._id || p.id || p) === productId);
                    
                    // Display discount badge if available, otherwise moderate fallback
                    const discount = product.discount || Math.floor(Math.random() * 15) + 5; 

                    return (
                        <div 
                            key={productId}
                            onClick={() => navigate(`/product/${productId}`)}
                            className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-[0_2px_15px_rgba(0,0,0,0.05)] border border-transparent dark:border-gray-700/50 group relative transition-all active:scale-[0.98] cursor-pointer"
                        >
                            {/* Price Badge */}
                            <div className="absolute top-3 left-3 z-10">
                                <div className="bg-[#FF6B6B] text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm">
                                    ₹{Number(product.price).toFixed(0)}
                                </div>
                            </div>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSaveProduct(product);
                                }}
                                className="absolute top-3 right-3 z-10 w-7 h-7 bg-white/90 dark:bg-gray-900/60 backdrop-blur-md rounded-full flex items-center justify-center text-gray-400 hover:text-[#FF6B6B] transition-colors shadow-sm"
                            >
                                <Bookmark size={14} fill={isSaved ? "#FF6B6B" : "none"} className={isSaved ? "text-[#FF6B6B]" : ""} />
                            </button>

                            {/* Image Container */}
                            <div className="aspect-square w-full bg-[#F9FAFB] dark:bg-gray-900/40 p-4 flex items-center justify-center group-hover:bg-gray-100 dark:group-hover:bg-gray-900/60 transition-colors overflow-hidden">
                                <img
                                    src={product.image || `${API_BASE_URL}/products/${productId}/image`}
                                    alt={product.title}
                                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                                    loading="lazy"
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://atlas-content-cdn.pixelbin.io/ast/feed_v2/static_assets/common/vegetable_placeholder.png'; }}
                                />
                            </div>

                            {/* Content */}
                            <div className="p-3 bg-white dark:bg-gray-800">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate mb-0.5">
                                    {t(product, 'title')}
                                </h3>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium truncate mb-2">
                                    {product.storeId?.name || product.brand || "Homly Direct"}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
};

export default DealsGrid;
