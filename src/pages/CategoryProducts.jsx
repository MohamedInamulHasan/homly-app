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
import { ChevronLeft, Zap, MapPin, ArrowRight, Search } from 'lucide-react';
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

    // Filter products by category AND search query (INCLUDE closed for search)
    const categoryProducts = useMemo(() => {
        return products.filter(product => {
            const matchesCategory = product.category && product.category.toLowerCase() === categoryName?.toLowerCase();
            const matchesSearch = !searchQuery.trim() ||
                product.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesCategory && matchesSearch;
        });
    }, [products, categoryName, searchQuery]);

    // Check if the product or its store is open/available
    const checkProductOpen = (product, store) => {
        if (product.isAvailable === false) return false;
        if (!isStoreOpen(store)) return false;
        
        if (product.useTimeLimit) {
            const now = new Date();
            const curTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            const op = product.openingTime || '00:00';
            const cl = product.closingTime || '23:59';
            if (op <= cl) return curTime >= op && curTime <= cl;
            return curTime >= op || curTime <= cl;
        }
        return true;
    };

    // Main display products (ONLY available/open)
    const displayProducts = useMemo(() => {
        return categoryProducts.filter(p => {
            const store = stores.find(s => (s._id || s.id) === (p.storeId?._id || p.storeId));
            return checkProductOpen(p, store);
        });
    }, [categoryProducts, stores]);

    // Always group products by title with centralized utility
    const groupedList = groupProducts(displayProducts, stores, { exactMatch: true });
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
            <div className="min-h-screen bg-[#E8EAEF] dark:bg-gray-900 pb-20 transition-colors duration-200">
                <div className="relative max-w-7xl mx-auto px-4 pt-8 pb-4 flex items-center justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute left-4 w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-[0_2px_15px_rgba(0,0,0,0.06)] dark:shadow-none text-gray-700 dark:text-gray-300 transition-all active:scale-90 z-10"
                    >
                        <ChevronLeft size={28} strokeWidth={1.5} />
                    </button>
                    <h1 className="text-xl font-normal text-gray-700 dark:text-gray-300 truncate leading-normal text-center px-16">
                        {(() => {
                            const fullName = t(categoryName);
                            const bracketIndex = fullName.indexOf('(');
                            if (bracketIndex !== -1) {
                                const mainName = fullName.substring(0, bracketIndex).trim();
                                const bracketPart = fullName.substring(bracketIndex).trim();
                                return `${mainName} ${bracketPart}`;
                            }
                            return fullName;
                        })()}
                    </h1>
                </div>

                <div className="pt-1 pb-6">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex items-center gap-3 relative z-[100]">
                            <div className="relative flex-1 group">
                                <form onSubmit={(e) => e.preventDefault()}>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={t('Search products...')}
                                        className="w-full pl-12 pr-4 py-4 rounded-full border-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:outline-none transition-all duration-300"
                                    />
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2E5A2E] transition-colors" size={20} />
                                </form>
                            </div>
                            <SortDropdown currentSort={globalSortOrder} onSortChange={setGlobalSortOrder} />

                            {/* Search Results Dropdown - Expanded to full container width */}
                            {searchQuery.trim() && (
                                <div className="absolute top-[calc(100%+12px)] left-0 right-0 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 max-h-96 overflow-y-auto z-[200] animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm">
                                    {(() => {
                                        const query = searchQuery.toLowerCase();
                                        const filteredDropdown = categoryProducts
                                            .filter(p => 
                                                p.title?.toLowerCase().includes(query) || 
                                                p.title_ta?.toLowerCase().includes(query)
                                            )
                                            .sort((a, b) => {
                                                const aStore = stores.find(s => (s._id || s.id) === (a.storeId?._id || a.storeId));
                                                const bStore = stores.find(s => (s._id || s.id) === (b.storeId?._id || b.storeId));
                                                
                                                const aOpen = checkProductOpen(a, aStore);
                                                const bOpen = checkProductOpen(b, bStore);
                                                
                                                // 1. Open first
                                                if (aOpen && !bOpen) return -1;
                                                if (!aOpen && bOpen) return 1;
                                                
                                                // 2. Starts with query prioritization
                                                const aTitle = a.title?.toLowerCase() || '';
                                                const bTitle = b.title?.toLowerCase() || '';
                                                
                                                const aStarts = aTitle.startsWith(query);
                                                const bStarts = bTitle.startsWith(query);
                                                
                                                if (aStarts && !bStarts) return -1;
                                                if (!aStarts && bStarts) return 1;
                                                return 0;
                                            })
                                            .slice(0, 10);

                                        if (filteredDropdown.length === 0) {
                                            return (
                                                <div className="p-8 text-center text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap overflow-hidden">
                                                    {t('No products found')}
                                                </div>
                                            );
                                        }

                                        return filteredDropdown.map((product) => {
                                            const productId = product._id || product.id;
                                            const productStore = stores.find(s => (s._id || s.id) === (product.storeId?._id || product.storeId));
                                            
                                            const isClosed = !checkProductOpen(product, productStore);

                                            return (
                                                <Link
                                                    key={productId}
                                                    to={isClosed ? '#' : `/product/${productId}`}
                                                    onClick={(e) => {
                                                        if (isClosed) {
                                                            e.preventDefault();
                                                            return;
                                                        }
                                                        setSearchQuery('');
                                                    }}
                                                    className={`flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50/80 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-50 dark:border-gray-700 last:border-b-0 ${isClosed ? 'cursor-not-allowed opacity-80' : ''}`}
                                                >
                                                    <div className="relative flex-shrink-0">
                                                        <div className={`w-12 h-12 rounded-[1rem] bg-gray-50 dark:bg-gray-700 p-1 flex items-center justify-center overflow-hidden border border-gray-100 dark:border-gray-600 ${isClosed ? 'blur-[1px]' : ''}`}>
                                                            <img
                                                                src={product.image || `${API_BASE_URL}/products/${productId}/image`}
                                                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100?text=No+Image'; }}
                                                                alt={product.title}
                                                                className="w-full h-full object-contain"
                                                            />
                                                        </div>
                                                        {isClosed && (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-[1rem]">
                                                                <span className="bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                                                                    {t('Closed')}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {product.unit && !isClosed && (
                                                            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg px-2 py-0.5 shadow-sm">
                                                                <p className="text-gray-500 dark:text-gray-400 text-[9px] font-bold">
                                                                    {productStore?.name?.split(' ')[0]} • {product.unit}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-col gap-0">
                                                            <p className={`font-normal text-gray-800 dark:text-gray-200 truncate text-[13px] tracking-tight leading-tight ${isClosed ? 'opacity-60' : ''}`}>
                                                                {t(product, 'title')}
                                                            </p>
                                                            <div className="flex items-center gap-1.5">
                                                                <span className={`text-[#2E5A2E] dark:text-[#CBF9B2] font-medium text-[11px] ${isClosed ? 'grayscale opacity-50' : ''}`}>₹{Number(product.price).toFixed(0)}</span>
                                                                {product.originalPrice > product.price && (
                                                                    <span className="text-gray-400 text-[10px] line-through font-normal opacity-40">₹{product.originalPrice}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        });
                                    })()}
                                </div>
                            )}
                        </div>
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
                                            ? 'bg-[#2E5A2E] text-white'
                                            : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800 hover:text-[#2E5A2E] dark:hover:text-[#CBF9B2]'
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
                                                    ? 'bg-[#2E5A2E] text-white shadow-md shadow-[#2E5A2E]/20'
                                                    : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800 hover:text-[#2E5A2E] dark:hover:text-[#CBF9B2]'
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
                                                            className="flex p-2 bg-[#2E5A2E] text-white rounded-xl shadow-lg shadow-green-500/20 hover:scale-110 active:scale-95 transition-all duration-300 ml-1"
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
                                                        <MapPin size={14} className="mr-1.5 text-[#2E5A2E]/60" />
                                                        <p className="text-xs font-bold truncate">
                                                            {section.address}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                                            {section.products.map(product => {
                                                if (fastMode) {
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
                                                        showCartControls={true}
                                                        stores={stores}
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
