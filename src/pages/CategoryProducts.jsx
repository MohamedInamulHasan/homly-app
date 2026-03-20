import { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCategories } from '../hooks/queries/useCategories';
import { useProducts } from '../hooks/queries/useProducts';
import { useStores } from '../hooks/queries/useStores';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { isStoreOpen } from '../utils/storeHelpers';
import { sortProductsByGoldAndOpen } from '../utils/productSorting';
import SimpleProductCard from '../components/SimpleProductCard';
import PullToRefreshLayout from '../components/PullToRefreshLayout';
import { ChevronLeft, Zap, MapPin, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '../utils/api';
import { groupProducts } from '../utils/productGrouping';
import ProductCard from '../components/ProductCard';
import SortDropdown from '../components/SortDropdown';

const CategoryProducts = () => {
    const { categoryName } = useParams();
    const { data: rawProducts = [], isLoading: productsLoading } = useProducts();
    const { data: rawStores = [], isLoading: storesLoading } = useStores();
    const { data: rawCategories = [] } = useCategories();
    const { t } = useLanguage();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const { fastMode, toggleFastMode, globalSortOrder, setGlobalSortOrder } = useData(); // Use global state
    const navigate = useNavigate();

    const isLoading = productsLoading || storesLoading;

    const products = Array.isArray(rawProducts) ? rawProducts : (rawProducts?.data || []);
    const stores = Array.isArray(rawStores) ? rawStores : (rawStores?.data || []);
    const categories = Array.isArray(rawCategories) ? rawCategories : (rawCategories?.data || []);

    // Filter products by category AND search query
    const categoryProducts = products.filter(product => {
        const matchesCategory = product.category && product.category.toLowerCase() === categoryName?.toLowerCase();
        const matchesSearch = !searchQuery.trim() ||
            product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description?.toLowerCase().includes(searchQuery.toLowerCase());

        // Consistent availability check
        const isAvailable = product.isAvailable !== false;

        return matchesCategory && matchesSearch && isAvailable;
    });

    // Always group products by title with centralized utility
    const groupedList = groupProducts(categoryProducts, stores, { exactMatch: true });
    const sortedList = sortProductsByGoldAndOpen(groupedList, stores);

    // Aggressive subcategory normalization (consistent with Home.jsx)
    const normalizeSub = (s) => {
        if (!s) return '';
        let clean = s.replace(/[0-9]/g, '').trim().toLowerCase();
        const unitWords = ['units', 'packs', 'pack', 'grams', 'gram', 'ml', 'liter', 'litre', 'kg', 'g', 'l', 'x', 'pc', 'pcs', 'pieces', 'piece', 'bottles', 'bottle', 'cans', 'can', 'boxes', 'box', 'rolls', 'roll', 'sheets', 'sheet', 'pairs', 'pair', 'sets', 'set', 'tubes', 'tube', 'jars', 'jar', 'bags', 'bag', 'strips', 'strip', 'bars', 'bar', 'cups', 'cup', 'sachets', 'sachet', 'pouches', 'pouch', 'cartons', 'carton', 'bundles', 'bundle', 'dzn', 'dozen', 'pkt', 'packet', 'pck', 'pckts'];
        unitWords.forEach(word => {
            clean = clean.replace(new RegExp(`\\b${word}\\b`, 'g'), '').trim();
        });
        if (clean.endsWith('s') && clean.length > 3) clean = clean.slice(0, -1);
        return clean.charAt(0).toUpperCase() + clean.slice(1);
    };

    // Subcategories for this category (from categories data)
    const currentCategory = categories.find(c =>
        (c.name || c.title || '').toLowerCase() === categoryName?.toLowerCase()
    );
    const subcategories = currentCategory?.subcategories || [];

    // Group and sort logic
    const sections = useMemo(() => {
        // 1. Group raw category products by store
        const storeGroups = categoryProducts.reduce((acc, product) => {
            const storeId = product.storeId?._id || product.storeId;
            const key = storeId || 'Other';
            if (!acc[key]) acc[key] = [];
            acc[key].push(product);
            return acc;
        }, {});

        const result = [];

        // 2. Process each store
        stores.forEach(s => {
            const storeId = s._id || s.id;
            if (storeGroups[storeId]) {
                // Within each store, group by title (Smart Title logic)
                let storeItems = groupProducts(storeGroups[storeId], stores, { exactMatch: true });

                // Filter by selected subcategory if one is active
                if (selectedSubcategory) {
                    const normalizedSelected = normalizeSub(selectedSubcategory);
                    storeItems = storeItems.filter(p => {
                        const rawSubs = Array.isArray(p.subcategory) ? p.subcategory : (p.subcategory ? [p.subcategory] : []);
                        return rawSubs.some(sub => normalizeSub(sub) === normalizedSelected);
                    });
                }

                // Apply global price sorting
                if (globalSortOrder !== 'none') {
                    storeItems.sort((a, b) => {
                        const priceA = Number(a.price || 0);
                        const priceB = Number(b.price || 0);
                        return globalSortOrder === 'lowToHigh' ? priceA - priceB : priceB - priceA;
                    });
                }

                if (storeItems.length > 0) {
                    result.push({
                        id: storeId,
                        name: s.name,
                        address: s.address,
                        type: 'store',
                        data: s, // Save store object for persists check
                        products: storeItems
                    });
                }
            }
        });

        // 3. Handle Other products (orphans)
        if (storeGroups['Other']) {
            let orphanItems = groupProducts(storeGroups['Other'], stores, { exactMatch: true });
            if (selectedSubcategory) {
                const normalizedSelected = normalizeSub(selectedSubcategory);
                orphanItems = orphanItems.filter(p => {
                    const rawSubs = Array.isArray(p.subcategory) ? p.subcategory : (p.subcategory ? [p.subcategory] : []);
                    return rawSubs.some(sub => normalizeSub(sub) === normalizedSelected);
                });
            }
            if (globalSortOrder !== 'none') {
                orphanItems.sort((a, b) => {
                    const priceA = Number(a.price || 0);
                    const priceB = Number(b.price || 0);
                    return globalSortOrder === 'lowToHigh' ? priceA - priceB : priceB - priceA;
                });
            }
            if (orphanItems.length > 0) {
                result.push({
                    id: 'Other',
                    name: t('Other Stores'),
                    type: 'other',
                    data: null,
                    products: orphanItems
                });
            }
        }

        return result;
    }, [categoryProducts, stores, selectedSubcategory, categoryName, globalSortOrder, t]);

    // Keep displayProducts for simple count checks
    const displayProducts = useMemo(() => sections.flatMap(s => s.products), [sections]);

    useEffect(() => {
        const activePill = document.getElementById('active-cat-sub-pill');
        if (activePill) {
            activePill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }, [selectedSubcategory]);

    // Get category image from first product
    const categoryImage = categoryProducts.length > 0 ? categoryProducts[0].image : null;

    return (
        <PullToRefreshLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors duration-200">
                {/* Header */}
                <div className="pt-4 pb-1">
                    <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                            <Link to="/" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors flex-shrink-0">
                                <ChevronLeft className="text-gray-600 dark:text-white" size={24} />
                            </Link>
                            {(() => {
                                const fullName = t(categoryName);
                                const bracketIndex = fullName.indexOf('(');

                                if (bracketIndex !== -1) {
                                    const mainName = fullName.substring(0, bracketIndex).trim();
                                    const bracketText = fullName.substring(bracketIndex).trim();

                                    return (
                                        <div className={`flex ${bracketText.length > 12 ? 'flex-col' : 'flex-row items-baseline gap-2'} min-w-0`}>
                                            <h1 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent capitalize truncate leading-tight" title={mainName}>
                                                {mainName}
                                            </h1>
                                            <span className={`text-xl md:text-2xl font-normal truncate leading-none text-gray-500 dark:text-gray-400 ${bracketText.length > 12 ? 'mt-2' : ''}`} title={bracketText}>
                                                {bracketText}
                                            </span>
                                        </div>
                                    );
                                }

                                return (
                                    <h1 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent capitalize truncate" title={fullName}>
                                        {fullName}
                                    </h1>
                                );
                            })()}
                        </div>
                    </div>
                </div>

                {/* Mobile Search Bar - Exactly like Home.jsx */}
                <div className="pt-1 pb-4">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex items-center gap-3 relative z-50">
                            <form
                                onSubmit={(e) => e.preventDefault()}
                                className="relative flex-1"
                            >
                                <div className="relative group">
                                    <input
                                        type="text"
                                        name="search"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={t('Search products...')}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-gray-100 dark:border-gray-800 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:shadow-lg transition-all duration-300"
                                    />
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 dark:text-blue-400 transition-transform group-focus-within:scale-110">
                                        <svg
                                            width="20"
                                            height="20"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            strokeWidth="2.5"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </form>

                            <SortDropdown currentSort={globalSortOrder} onSortChange={setGlobalSortOrder} />
                        </div>

                        {/* Search Results Dropdown */}
                        {searchQuery.trim() && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-30">
                                {(() => {
                                    const filteredDropdown = categoryProducts.slice(0, 5);

                                    if (filteredDropdown.length === 0) {
                                        return (
                                            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                                {t('No products found')}
                                            </div>
                                        );
                                    }

                                    return filteredDropdown.map((product) => {
                                        const productId = product._id || product.id;
                                        // Check if store is open
                                        const productStore = stores.find(s => (s._id || s.id) === (product.storeId?._id || product.storeId));
                                        const storeOpen = productStore ? isStoreOpen(productStore) : true;

                                        return (
                                            <Link
                                                key={productId}
                                                to={`/product/${productId}`}
                                                onClick={() => setSearchQuery('')}
                                                className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                                            >
                                                <div className="relative flex-shrink-0">
                                                    <img
                                                        src={product.image || `${API_BASE_URL}/products/${productId}/image`}
                                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100?text=No+Image'; }}
                                                        alt={product.title}
                                                        className={`w-12 h-12 rounded-lg object-cover ${!storeOpen ? 'grayscale opacity-60' : ''}`}
                                                    />
                                                    {/* Unit Tag on Image */}
                                                    {product.unit && (
                                                        <div className="absolute bottom-1 left-1 right-1 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 border border-white/20 rounded-md py-0.5 shadow-sm">
                                                            <p className="text-white text-[8px] text-center font-bold truncate px-1">
                                                                {product.unit}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                                                            {(() => {
                                                                const fullTitle = t(product, 'title');
                                                                const bracketIndex = fullTitle.indexOf('(');
                                                                if (bracketIndex !== -1) {
                                                                    const mainPart = fullTitle.substring(0, bracketIndex);
                                                                    const bracketPart = fullTitle.substring(bracketIndex);
                                                                    return (
                                                                        <>
                                                                            <span>{mainPart}</span>
                                                                            <span className="font-normal text-gray-500 dark:text-gray-400">{bracketPart}</span>
                                                                        </>
                                                                    );
                                                                }
                                                                return fullTitle;
                                                            })()}
                                                        </p>
                                                        {!storeOpen && (
                                                            <span className="text-[10px] font-bold text-red-500 flex-shrink-0 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded-full border border-red-100 dark:border-red-800">
                                                                {t('Store Closed')}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        ₹{Number(product.price).toFixed(0)}
                                                    </p>
                                                </div>
                                            </Link>
                                        );
                                    });
                                })()}
                            </div>
                        )}
                    </div>
                </div>

                {/* Subcategories Scroller */}
                {subInFilter.length > 0 && !loading?.categories && (
                    <div className="pb-2 mb-1 transition-colors duration-200">
                        <div className="max-w-7xl mx-auto px-4 overflow-x-auto p-2 pb-4 scrollbar-hide">
                            <div className="flex justify-start">
                                <div className="flex space-x-3">
                                    <button
                                        id={!selectedSubcategory ? "active-cat-sub-pill" : undefined}
                                        onClick={() => {
                                            setSelectedSubcategory(null);
                                            document.getElementById("active-cat-sub-pill")?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                                        }}
                                        className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${!selectedSubcategory
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                            : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
                                            }`}
                                    >
                                        <span className="whitespace-nowrap">{t('All')}</span>
                                    </button>
                                    {subcategories.map((sub, idx) => {
                                        const isActive = selectedSubcategory === sub;
                                        return (
                                            <button
                                                key={idx}
                                                id={isActive ? "active-cat-sub-pill" : undefined}
                                                onClick={() => {
                                                    setSelectedSubcategory(sub);
                                                    document.getElementById("active-cat-sub-pill")?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                                                }}
                                                className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isActive
                                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                                    : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
                                                    }`}
                                            >
                                                <span className="font-medium whitespace-nowrap text-sm">
                                                    {t(sub)}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="max-w-7xl mx-auto px-4 pt-1 pb-6">
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
                    ) : displayProducts.length > 0 ? (
                        <div className="space-y-10 pb-12">
                            {sections.map((section) => {
                                const isOpen = section.data ? isStoreOpen(section.data) : true;
                                return (
                                    <div key={section.id} className={`transition-all duration-300 ${!isOpen ? 'grayscale-[0.8] opacity-75' : ''}`}>
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white leading-tight">
                                                        {t(section.name)}
                                                    </h2>
                                                    {section.type === 'store' && isOpen && (
                                                        <Link
                                                            to={`/store/${section.id}`}
                                                            state={{ fromCategory: categoryName }}
                                                            className="flex p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 hover:scale-110 active:scale-95 transition-all duration-300 ml-1"
                                                            title={t('Visit Store')}
                                                        >
                                                            <ArrowRight size={18} />
                                                        </Link>
                                                    )}
                                                    {!isOpen && (
                                                        <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] shadow-xl border border-white/20">
                                                            {t('Closed')}
                                                        </span>
                                                    )}
                                                </div>
                                                {section.address && (
                                                    <div className="flex items-center text-gray-500 dark:text-gray-400 mt-2">
                                                        <MapPin size={14} className="mr-1.5 text-blue-500/60" />
                                                        <p className="text-xs font-bold truncate">
                                                            {section.address}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                                            {section.products.map(product => {
                                                if (fastMode || product.isGroup) {
                                                    return (
                                                        <SimpleProductCard
                                                            key={product._id || product.id}
                                                            product={product}
                                                            isFastPurchase={fastMode}
                                                        />
                                                    );
                                                }
                                                return (
                                                    <ProductCard
                                                        key={product._id || product.id}
                                                        product={product}
                                                        showHeart={false}
                                                        showCartControls={false}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
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
                                {t('We couldn\'t find any products in this category.')}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </PullToRefreshLayout >
    );
};

export default CategoryProducts;
