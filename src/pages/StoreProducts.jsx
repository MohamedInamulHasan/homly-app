import { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Phone, ChevronRight, AlertCircle, Zap, Search } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { isStoreOpen } from '../utils/storeHelpers';
import { API_BASE_URL } from '../utils/api';
import { groupProducts } from '../utils/productGrouping';
import ProductCard from '../components/ProductCard';
import SimpleProductCard from '../components/SimpleProductCard';
import SortDropdown from '../components/SortDropdown';

const ProductSkeleton = ({ fastMode }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse flex flex-col h-full`}>
        <div className="w-full aspect-square bg-gray-200 dark:bg-gray-700"></div>
        <div className="p-3 space-y-3 flex-grow">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mt-2"></div>
        </div>
        {fastMode && <div className="p-3 pt-0"><div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div></div>}
    </div>
);

const StoreProducts = () => {
    const { id } = useParams();
    const { products, stores, categories, loading, fastMode, toggleFastMode, globalSortOrder, setGlobalSortOrder } = useData();
    const { t } = useLanguage();
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const storeId = id;
    const navigate = useNavigate();
    const location = useLocation();
    const isFromHome = location.state?.from === 'home';

    // Find store and its products
    const store = stores.find(s => (s._id || s.id) === storeId);

    // Filter products for this store
    const storeProducts = useMemo(() => {
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        return products
            .filter(p => p.isAvailable !== false) // Filter out manual unavailable
            .filter(p => {
                // Time window check
                if (p.useTimeLimit) {
                    const opening = p.openingTime || '00:00';
                    const closing = p.closingTime || '23:59';
                    if (opening <= closing) {
                        if (currentTime < opening || currentTime > closing) return false;
                    } else {
                        // Overnights case
                        if (currentTime < opening && currentTime > closing) return false;
                    }
                }
                
                // Store connection check
                const pStoreId = p.storeId?._id || p.storeId;
                const targetId = storeId;
                return pStoreId == targetId || String(pStoreId) === String(targetId);
            });
    }, [products, storeId]);

    // Group products by title with centralized utility
    const groupedStoreProducts = useMemo(() => {
        return groupProducts(storeProducts, stores, { forcedStoreId: storeId });
    }, [storeProducts, stores, storeId]);

    // Aggressive subcategory normalization (consistent with CategoryProducts.jsx)
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

    // Extract unique subcategories and their counts from the store's products
    const subcategoryData = useMemo(() => {
        const counts = {};
        const relevantCategoryIds = new Set();
        const relevantCategoryNames = new Set();

        if (store && store.type) {
            const types = Array.isArray(store.type) ? store.type : [store.type];
            types.forEach(t => relevantCategoryNames.add(t.toLowerCase()));
        }

        groupedStoreProducts.forEach(p => {
            const subs = Array.isArray(p.subcategory) ? p.subcategory : (p.subcategory ? [p.subcategory] : []);
            const unique = [...new Set(subs.map(normalizeSub).filter(Boolean))];
            unique.forEach(s => {
                counts[s] = (counts[s] || 0) + 1;
            });
            const catId = p.categoryId?._id || p.categoryId;
            if (catId) {
                relevantCategoryIds.add(String(catId));
            }
        });

        const result = Object.entries(counts)
            .map(([name, count]) => ({ name, count }));

        // Get the subcategory order from the relevant categories
        const subOrder = [];
        categories.forEach(cat => {
            const isMatch = relevantCategoryIds.has(String(cat._id || cat.id)) ||
                relevantCategoryNames.has(cat.name?.toLowerCase());

            if (isMatch) {
                if (cat.subcategories && Array.isArray(cat.subcategories)) {
                    cat.subcategories.forEach(s => {
                        const normalized = normalizeSub(s);
                        if (!subOrder.includes(normalized)) {
                            subOrder.push(normalized);
                        }
                    });
                }
            }
        });

        // Sort based on the subOrder if available, otherwise fallback to alphabetical
        return result.sort((a, b) => {
            const indexA = subOrder.indexOf(a.name);
            const indexB = subOrder.indexOf(b.name);

            if (indexA !== -1 && indexB !== -1) {
                return indexA - indexB;
            } else if (indexA !== -1) {
                return -1;
            } else if (indexB !== -1) {
                return 1;
            }
            return a.name.localeCompare(b.name);
        });
    }, [groupedStoreProducts, categories, store]);

    const totalProductCount = useMemo(() => groupedStoreProducts.length, [groupedStoreProducts]);

    // Group and sort logic (matches CategoryProducts.jsx)
    const sections = useMemo(() => {
        const groups = {};

        // Pre-filter by search query
        const filteredList = searchQuery.trim()
            ? groupedStoreProducts.filter(p =>
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
            )
            : groupedStoreProducts;

        if (!selectedSubcategory) {
            const allItems = filteredList;
            if (allItems.length === 0) return [];

            if (globalSortOrder !== 'none') {
                allItems.sort((a, b) => {
                    const priceA = Number(a.price || 0);
                    const priceB = Number(b.price || 0);
                    return globalSortOrder === 'lowToHigh' ? priceA - priceB : priceB - priceA;
                });
            }
            return [['_all_', allItems]];
        }
        const storeTypes = store ? (Array.isArray(store.type) ? store.type : [store.type]) : [];
        const isFoodStore = storeTypes.some(type =>
            ['foods', 'hotels', 'restaurants', 'food', 'hotel', 'restaurant'].includes(type?.toLowerCase())
        );

        const getCurrentMeal = () => {
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 12) return 'Breakfast';
            if (hour >= 12 && hour < 17) return 'Lunch';
            return 'Dinner';
        };

        const currentMeal = getCurrentMeal();

        // Separate 'All' products to always be top or bottom if needed
        // For food stores, we prioritize current meal subcategories in the 'All' section
        // We handle grouping products into subcategories
        filteredList.forEach(p => {
            const rawSubs = Array.isArray(p.subcategory) ? p.subcategory : (p.subcategory ? [p.subcategory] : []);
            const normalizedSubs = [...new Set(
                rawSubs
                    .filter(Boolean)
                    .map(normalizeSub)
                    .filter(s => s !== '')
            )].sort();

            const subKey = normalizedSubs.join(' & ') || 'Other';
            if (!groups[subKey]) groups[subKey] = [];
            groups[subKey].push(p);
        });

        // 1. Sort products WITHIN each group by their manual 'order'
        Object.keys(groups).forEach(key => {
            groups[key].sort((a, b) => {
                // If sorting by price is active, it takes precedence
                if (globalSortOrder !== 'none') {
                    const priceA = Number(a.price || 0);
                    const priceB = Number(b.price || 0);
                    return globalSortOrder === 'lowToHigh' ? priceA - priceB : priceB - priceA;
                }
                // Fallback to manual order
                return (a.order || 0) - (b.order || 0);
            });
        });

        // 2. Filter by selected subcategory if one is active
        if (selectedSubcategory) {
            const normalizedSelected = normalizeSub(selectedSubcategory);
            const filteredProducts = filteredList
                .filter(p => {
                    const rawSubs = Array.isArray(p.subcategory) ? p.subcategory : (p.subcategory ? [p.subcategory] : []);
                    return rawSubs.some(s => normalizeSub(s) === normalizedSelected);
                })
                .sort((a, b) => (a.order || 0) - (b.order || 0));

            return [['_all_', filteredProducts]];
        }

        // 3. Sort the GROUPS themselves
        return Object.entries(groups).sort((a, b) => {
            const [nameA, productsA] = a;
            const [nameB, productsB] = b;

            // Prioritize by food meal times if it's a food store
            if (isFoodStore) {
                const aIsMeal = [currentMeal, 'Meals', 'Tiffin'].some(m => nameA.includes(m));
                const bIsMeal = [currentMeal, 'Meals', 'Tiffin'].some(m => nameB.includes(m));
                if (aIsMeal && !bIsMeal) return -1;
                if (!aIsMeal && bIsMeal) return 1;
            }

            // Fallback to the 'order' of the first product in the group
            const orderA = productsA[0]?.order || 0;
            const orderB = productsB[0]?.order || 0;
            return orderA - orderB;
        });
    }, [groupedStoreProducts, selectedSubcategory, globalSortOrder, searchQuery, t, store]);

    // Keep displayProducts for simple count checks
    const displayProducts = useMemo(() => sections.flatMap(s => s[1]), [sections]);

    useEffect(() => {
        const activePill = document.getElementById('active-sub-pill');
        if (activePill) {
            activePill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }, [selectedSubcategory]);

    if (!store) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('Store not found')}</h2>
                <Link to="/store" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-2">
                    <ArrowLeft size={20} />
                    {t('Back to Stores')}
                </Link>
            </div>
        );
    }

    const storeIsOpen = isStoreOpen(store);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors duration-200">
            {/* Header / Breadcrumbs */}
            <div className="pt-6 pb-2">
                <div className="max-w-7xl mx-auto px-4">
                    <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                        <Link to={isFromHome ? "/" : "/store"} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                            {isFromHome ? t('Home') : t('Stores')}
                        </Link>
                        <ChevronRight size={16} className="mx-2" />
                        <span className="font-semibold text-gray-900 dark:text-white leading-normal pb-0.5">
                            {store.name}
                        </span>
                    </nav>

                    <div className="flex justify-between items-center">
                        <h1 className={`${store.name.length > 25 ? 'text-xl md:text-3xl' : store.name.length > 15 ? 'text-2xl md:text-4xl' : 'text-3xl md:text-4xl'} font-bold leading-normal pb-0.5 whitespace-nowrap`}>
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                                {store.name}
                            </span>
                        </h1>
                    </div>
                </div>
            </div>

            {/* Search Bar & Sort Dropdown Section */}
            <div className="pt-2 pb-4">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center gap-3 relative z-50">
                        {/* Search Bar */}
                        <div className="relative flex-1">
                            <form onSubmit={(e) => e.preventDefault()}>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={t('Search in store...')}
                                    className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:shadow-lg transition-all duration-300 text-sm"
                                />
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-500 dark:text-blue-400" size={18} />
                            </form>
                        </div>

                        {/* Sort Dropdown */}
                        <SortDropdown currentSort={globalSortOrder} onSortChange={setGlobalSortOrder} />
                    </div>

                    {/* Search Results Dropdown */}
                    {searchQuery.trim() && (
                        <div className="absolute left-4 right-4 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 max-h-80 overflow-y-auto overflow-x-hidden z-50">
                            {(() => {
                                const q = searchQuery.toLowerCase();
                                const results = storeProducts.filter(p =>
                                    p.title.toLowerCase().includes(q) ||
                                    (p.description && p.description.toLowerCase().includes(q))
                                ).sort((a, b) => {
                                    const aDisplay = t(a, 'title').toLowerCase();
                                    const bDisplay = t(b, 'title').toLowerCase();
                                    const aStarts = aDisplay.startsWith(q);
                                    const bStarts = bDisplay.startsWith(q);

                                    if (aStarts && !bStarts) return -1;
                                    if (!aStarts && bStarts) return 1;
                                    return 0;
                                }).slice(0, 5);

                                if (results.length === 0) {
                                    return (
                                        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                            {t('No products found')}
                                        </div>
                                    );
                                }

                                return results.map(product => {
                                    const productId = product._id || product.id;

                                    return (
                                        <Link
                                            key={productId}
                                            to={`/product/${productId}`}
                                            className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                                            onClick={() => setSearchQuery('')}
                                        >
                                            <div className="relative flex-shrink-0">
                                                <img
                                                    src={product.image || `${API_BASE_URL}/products/${productId}/image`}
                                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100?text=No+Image'; }}
                                                    alt={product.title}
                                                    className={`w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-100 dark:border-gray-700 ${!storeIsOpen ? 'grayscale opacity-60' : ''}`}
                                                />
                                                {/* Unit Badge (Order Summary Style - More Compact) */}
                                                {product.unit && (
                                                    <div className="absolute bottom-0 right-0 bg-white/95 backdrop-blur-none px-1 py-0 rounded-tl-sm z-10 pointer-events-none shadow-sm border-l border-t border-gray-100 dark:border-gray-700 max-w-full overflow-hidden flex items-center h-2.5">
                                                        <span className={`font-semibold text-gray-900 whitespace-nowrap inline-block ${product.unit.length > 8 ? 'text-[5px]' : 'text-[7px]'}`}>
                                                            {product.unit}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 px-1">
                                                <div className="flex items-center justify-between gap-2 overflow-hidden">
                                                    <div className="font-semibold text-sm text-gray-900 dark:text-white truncate">
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
                                                    </div>
                                                    {!storeIsOpen && (
                                                        <span className="text-[10px] font-bold text-red-500 flex-shrink-0 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded-full border border-red-100 dark:border-red-800">
                                                            {t('Store Closed')}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">₹{Number(product.price).toFixed(0)}</p>
                                            </div>
                                        </Link>
                                    );
                                });
                            })()}
                        </div>
                    )}
                </div>
            </div>

            {/* Store Closed Banner (Moved here) */}
            <div className="max-w-7xl mx-auto px-4">
                {!storeIsOpen && (
                    <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 flex items-center gap-3">
                        <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
                        <div>
                            <p className="font-semibold text-red-900 dark:text-red-200 text-sm">{t('Store Closed')}</p>
                            {store.timingType !== 'permanent' && (
                                <p className="text-xs text-red-700 dark:text-red-300">
                                    {t('Opens')} {store.openingTime || '9:00 AM'}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Subcategories Scroller */}
            {subcategoryData.length > 1 && !loading?.categories && (
                <div className="pb-1 mb-1 transition-colors duration-200">
                    <div className="max-w-7xl mx-auto px-4 overflow-x-auto p-2 pb-1 scrollbar-hide">
                        <div className="flex justify-start">
                            <div className="flex space-x-3 py-2">
                                    {!loading.products && (
                                        <button
                                            id={!selectedSubcategory ? "active-sub-pill" : undefined}
                                            onClick={() => {
                                                setSelectedSubcategory(null);
                                                document.getElementById("active-sub-pill")?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                                            }}
                                            className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${!selectedSubcategory
                                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                                : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
                                                }`}
                                        >
                                            <span className="whitespace-nowrap leading-normal pb-0.5">
                                                {t('All')}
                                            </span>
                                        </button>
                                    )}
                                {subcategoryData.map(({ name, count }, idx) => {
                                    const isActive = selectedSubcategory === name;
                                    return (
                                        <button
                                            key={idx}
                                            id={isActive ? "active-sub-pill" : undefined}
                                            onClick={() => {
                                                setSelectedSubcategory(name);
                                                document.getElementById("active-sub-pill")?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                                            }}
                                            className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isActive
                                                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                                : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
                                                }`}
                                        >
                                            <span className="whitespace-nowrap leading-normal pb-0.5">
                                                {t(name)}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-4 pt-1 pb-4">
                {/* Loading State Skeleton */}
                {loading.products ? (
                    <div className={`grid gap-4 sm:gap-6 ${fastMode ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'}`}>
                        {[...Array(10)].map((_, i) => (
                            <ProductSkeleton key={i} fastMode={fastMode} />
                        ))}
                    </div>
                ) : sections.length > 0 ? (
                    <div className="space-y-8">
                        {sections.map(([groupName, groupProducts]) => (
                            <div key={groupName}>
                                {groupName !== '_all_' && !selectedSubcategory && (
                                    <div className="flex justify-between items-center mb-6 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm -mx-4 px-4 py-2.5 border-y border-gray-200 dark:border-gray-700/50">
                                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                            <div className="w-1.5 h-6 bg-blue-600 dark:bg-blue-500 rounded-full"></div>
                                            {t(groupName)}
                                        </h2>
                                    </div>
                                )}
                                <div className={`grid gap-4 sm:gap-6 ${fastMode ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-6' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'}`}>
                                    {groupProducts.map((product) => (
                                        (fastMode || product.isGroup) ? (
                                            <SimpleProductCard key={product._id || product.id} product={product} isFastPurchase={fastMode} />
                                        ) : (
                                            <ProductCard key={product._id || product.id} product={product} showHeart={false} showCartControls={false} />
                                        )
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-800 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-700 shadow-sm transition-all animate-in fade-in zoom-in duration-500">
                        <div className="w-28 h-28 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mb-8 shadow-inner">
                            <span className="text-6xl animate-bounce">📦</span>
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
                            {searchQuery.trim() || selectedSubcategory ? t('No matches found') : t('Store is Empty')}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto text-center text-lg leading-relaxed mb-10 px-6">
                            {searchQuery.trim() || selectedSubcategory
                                ? t('We couldn\'t find any products matching your current filters. Try adjusting your search or category.')
                                : t('This store hasn\'t added any products yet. Please check back later or explore other stores.')}
                        </p>
                        {(searchQuery.trim() || selectedSubcategory) && (
                            <button
                                onClick={() => { setSearchQuery(''); setSelectedSubcategory(null); }}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                            >
                                {t('Clear All Filters')}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoreProducts;
