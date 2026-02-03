import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/queries/useProducts';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext'; // Import useData
import SimpleProductCard from '../components/SimpleProductCard';
import ProductCard from '../components/ProductCard';
import PullToRefreshLayout from '../components/PullToRefreshLayout';
import { ChevronLeft, Zap } from 'lucide-react';

const ProductGroupProducts = () => {
    const { productName } = useParams();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { fastMode, toggleFastMode } = useData(); // Global state

    // Fetch all products - we catch them from cache/query
    const { data: rawProducts = [], isLoading } = useProducts();
    const products = Array.isArray(rawProducts) ? rawProducts : (rawProducts?.data || []);

    // Filter products by name (case-insensitive)
    // DecodeURIComponent is handled by router usually, but let's be safe if manual decoding needed
    const decodedName = decodeURIComponent(productName);

    const groupProducts = products.filter(product =>
        product.title?.toLowerCase().trim() === decodedName.toLowerCase().trim()
    );

    return (
        <PullToRefreshLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors duration-200">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0 flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                            >
                                <ChevronLeft className="text-gray-600 dark:text-white" size={24} />
                            </button>
                            <div className="flex-1 min-w-0">
                                {(() => {
                                    const fullTitle = t(decodedName);
                                    const bracketIndex = fullTitle.indexOf('(');

                                    if (bracketIndex !== -1) {
                                        const mainTitle = fullTitle.substring(0, bracketIndex).trim();
                                        const bracketText = fullTitle.substring(bracketIndex).trim();
                                        const isLongTitle = mainTitle.length > 20;

                                        return (
                                            <div className="flex flex-col min-w-0">
                                                <h1 className={`font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent capitalize truncate ${isLongTitle ? 'text-base sm:text-lg' : 'text-xl md:text-2xl'}`} title={mainTitle}>
                                                    {mainTitle}
                                                </h1>
                                                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium truncate" title={bracketText}>
                                                    {bracketText}
                                                </span>
                                            </div>
                                        );
                                    }

                                    const isLongTitle = fullTitle.length > 20;
                                    return (
                                        <h1 className={`font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent capitalize truncate ${isLongTitle ? 'text-base sm:text-lg' : 'text-xl md:text-2xl'}`} title={fullTitle}>
                                            {fullTitle}
                                        </h1>
                                    );
                                })()}
                            </div>
                        </div>

                        <button
                            onClick={toggleFastMode}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all active:scale-95 text-xs font-medium ${fastMode
                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                                }`}
                        >
                            <Zap size={14} className={fastMode ? 'fill-white' : ''} />
                            <span>{fastMode ? t('Fast ON') : t('Fast')}</span>
                        </button>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 py-6">
                    {isLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse flex flex-col h-full">
                                    <div className="w-full aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl mb-3"></div>
                                    <div className="space-y-2 flex-grow">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mt-2"></div>
                                    </div>
                                    <div className="mt-3">
                                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : groupProducts.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {groupProducts.map(product => (
                                fastMode ? (
                                    <SimpleProductCard key={product._id || product.id} product={product} isFastPurchase={true} />
                                ) : (
                                    <ProductCard key={product._id || product.id} product={product} showCartControls={false} />
                                )
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <span className="text-4xl">🛍️</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                {t('No products found')}
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400">
                                {t('We couldn\'t find any products with this name.')}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </PullToRefreshLayout>
    );
};

export default ProductGroupProducts;
