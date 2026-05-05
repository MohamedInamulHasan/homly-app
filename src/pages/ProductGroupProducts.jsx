import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/queries/useProducts';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext'; // Import useData
import SimpleProductCard from '../components/SimpleProductCard';
import ProductCard from '../components/ProductCard';
import PullToRefreshLayout from '../components/PullToRefreshLayout';
import { ChevronLeft, Zap } from 'lucide-react';
import { isStoreOpen, isProductScheduled } from '../utils/storeHelpers';
import { useStores } from '../hooks/queries/useStores';

const ProductGroupProducts = () => {
    const { productName } = useParams();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { fastMode, toggleFastMode } = useData(); // Global state

    // Fetch stores for status check
    const { data: rawStores = [] } = useStores();
    const stores = Array.isArray(rawStores) ? rawStores : (rawStores?.data || []);

    // Fetch all products - we catch them from cache/query
    const { data: rawProducts = [], isLoading } = useProducts();
    const products = Array.isArray(rawProducts) ? rawProducts : (rawProducts?.data || []);

    // Filter products by name (case-insensitive)
    const decodedName = decodeURIComponent(productName);

    const storeIdParam = searchParams.get('storeId');

    const groupProducts = products
        .filter(product => {
            const productTitle = (product.title || '').trim();
            const searchTitle = decodedName.trim();
            const isExactTitleSearch = searchTitle.includes('(');

            let matchesName;
            if (isExactTitleSearch) {
                // URL has brackets e.g. "Pizza (100)"
                // Try 1: exact full-title match  → "Pizza (100)" === "Pizza (100)"
                const exactMatch = productTitle.toLowerCase() === searchTitle.toLowerCase();

                if (!exactMatch) {
                    // Try 2: synthetically built title — DB has "Pizza" + unit "100"
                    const searchBase = searchTitle.substring(0, searchTitle.indexOf('(')).trim().toLowerCase();
                    const searchBracket = searchTitle.match(/\(([^)]+)\)/)?.[1]?.toLowerCase() || '';

                    const productBase = productTitle.split('(')[0].trim().toLowerCase();
                    const productBracketFromTitle = productTitle.match(/\(([^)]+)\)/)?.[1]?.toLowerCase() || '';
                    const productBracketFromUnit = (product.unit || '').toLowerCase();

                    matchesName = productBase === searchBase &&
                        (productBracketFromTitle === searchBracket || productBracketFromUnit === searchBracket);
                } else {
                    matchesName = true;
                }
            } else {
                // Plain base name: match by base title (before any bracket)
                const baseProductTitle = productTitle.split('(')[0].trim().toLowerCase();
                matchesName = baseProductTitle === searchTitle.toLowerCase();
            }

            // Consistent availability check (Manual + Time-based)
            if (product.isAvailable === false) return false;

            if (!isProductScheduled(product)) return false;

            // Apply storeId filter when present in the URL.
            // - From store page: storeId IS set → only show that store's products ✅
            // - From Home page group click: no storeId in URL → show all stores ✅
            let matchesStore = true;
            if (storeIdParam) {
                const pStoreId = product.storeId?._id || product.storeId;
                matchesStore = pStoreId && (String(pStoreId) === String(storeIdParam));
            }

            return matchesName && matchesStore;
        })
        .sort((a, b) => {
            // Sort: Open stores first, then by price
            const storeA = stores.find(s => (s._id || s.id) === (a.storeId?._id || a.storeId));
            const storeB = stores.find(s => (s._id || s.id) === (b.storeId?._id || b.storeId));

            // Default to TRUE (Open) if store is missing
            const isOpenA = storeA ? isStoreOpen(storeA) : true;
            const isOpenB = storeB ? isStoreOpen(storeB) : true;

            if (isOpenA && !isOpenB) return -1;
            if (!isOpenA && isOpenB) return 1;
            return Number(a.price) - Number(b.price);
        });

    return (
        <PullToRefreshLayout>
            <div className="min-h-screen bg-[#E8EAEF] dark:bg-gray-900 pb-20 transition-colors duration-200">
                {/* Clean Header */}
                <div className="relative max-w-7xl mx-auto px-4 pt-8 pb-2 flex items-center justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute left-4 w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-[0_2px_15px_rgba(0,0,0,0.06)] dark:shadow-none text-gray-700 dark:text-gray-300 transition-all active:scale-90 z-10"
                    >
                        <ChevronLeft size={28} strokeWidth={1.5} />
                    </button>
                    <h1 className="text-xl font-medium text-gray-700 dark:text-gray-300 truncate leading-normal text-center px-16">
                        {(() => {
                            const fullTitle = t(decodedName);
                            const bracketIndex = fullTitle.indexOf('(');
                            let mainTitle = fullTitle;
                            let bracketText = '';

                            if (bracketIndex !== -1) {
                                mainTitle = fullTitle.substring(0, bracketIndex).trim();
                                bracketText = fullTitle.substring(bracketIndex).trim();
                            } else {
                                const firstProduct = groupProducts[0];
                                if (firstProduct) {
                                    const pTitle = firstProduct.title || '';
                                    const pTitleTa = firstProduct.title_ta || '';
                                    const bMatch = pTitle.match(/\(([^)]+)\)/);
                                    if (bMatch) bracketText = bMatch[0];
                                    else if (pTitleTa && pTitleTa !== pTitle) bracketText = `(${pTitleTa})`;
                                }
                            }

                            return `${mainTitle} ${bracketText || ''}`;
                        })()}
                    </h1>
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
                                    <ProductCard 
                                        key={product._id || product.id} 
                                        product={product} 
                                        showCartControls={true} 
                                        stores={stores}
                                    />
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
