import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { MapPin, Search, Star, Clock, Phone, Store } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { isStoreOpen, formatTime12h } from '../utils/storeHelpers';
import PullToRefreshLayout from '../components/PullToRefreshLayout';
import StoreCard from '../components/StoreCard';
import { API_BASE_URL } from '../utils/api';

const Shop = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const { stores, categories: dbCategories, loading, initialLoading } = useData();
    const { t } = useLanguage();

    // Create a Set of valid category names for filtering store tags
    const validCategoryNames = useMemo(() => new Set((dbCategories || []).map(c => c.name.toLowerCase())), [dbCategories]);
    const navigate = useNavigate();

    const categoryFilter = searchParams.get('category') || 'All';

    // Create categories array with "All" option first, then add categories from database
    const categoriesList = [
        { name: 'All' },
        ...(dbCategories || []).map(cat => ({ name: cat.name }))
    ];

    // Safety check for stores array to prevent crash if undefined (though DataContext should init it)
    const safeStores = stores || [];

    // Calculate store counts per category
    const categoryData = useMemo(() => {
        const counts = {};
        safeStores.forEach(store => {
            const types = Array.isArray(store.type) ? store.type : (store.type ? [store.type] : []);
            types.forEach(t => {
                const typeName = t.toLowerCase();
                counts[typeName] = (counts[typeName] || 0) + 1;
            });
        });

        return categoriesList.map(cat => {
            const name = cat.name;
            let count = 0;
            if (name === 'All') {
                count = safeStores.length;
            } else {
                count = counts[name.toLowerCase()] || 0;
            }
            return { name, count };
        });
    }, [safeStores, dbCategories]);

    const filteredStores = safeStores.filter(store => {
        const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (store.address && store.address.toLowerCase().includes(searchQuery.toLowerCase()));

        // Flexible matching for category/type (Handle Array or String)
        const matchesCategory = categoryFilter === 'All' ||
            (Array.isArray(store.type)
                ? store.type.some(t => t.toLowerCase() === categoryFilter.toLowerCase())
                : store.type && store.type.toLowerCase() === categoryFilter.toLowerCase());

        return matchesSearch && matchesCategory;
    }).sort((a, b) => {
        const isOpenA = isStoreOpen(a);
        const isOpenB = isStoreOpen(b);
        // Open stores (true) come first (-1), Closed (false) come last (1)
        if (isOpenA === isOpenB) return 0;
        return isOpenA ? -1 : 1;
    });

    const handleCategoryClick = (categoryName) => {
        setSearchParams({ category: categoryName });
    };

    useEffect(() => {
        const activePill = document.getElementById('active-category-pill');
        if (activePill) {
            activePill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }, [categoryFilter]);

    const isStoresLoading = loading?.stores || initialLoading;
    const isCategoriesLoading = loading?.categories || initialLoading;

    return (
        <PullToRefreshLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-5">
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-6">{t('Find a Store')}</h1>
                        <div className="relative max-w-xl mb-6">
                            <input
                                type="text"
                                placeholder={t('Search by store name or location...')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-gray-100 dark:border-gray-800 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:shadow-lg transition-all duration-300"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 dark:text-blue-400" size={22} />

                            {/* Search Results Dropdown */}
                            {searchQuery.trim() && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-80 overflow-y-auto z-50 w-full overflow-x-hidden">
                                    {(() => {
                                        const q = searchQuery.toLowerCase();
                                        const results = safeStores.filter(store =>
                                            store.name?.toLowerCase().includes(q) ||
                                            store.address?.toLowerCase().includes(q)
                                        ).sort((a, b) => {
                                            const aName = t(a, 'name').toLowerCase();
                                            const bName = t(b, 'name').toLowerCase();
                                            const aStarts = aName.startsWith(q);
                                            const bStarts = bName.startsWith(q);
                                            if (aStarts && !bStarts) return -1;
                                            if (!aStarts && bStarts) return 1;
                                            return 0;
                                        }).slice(0, 5);

                                        if (results.length === 0) {
                                            return (
                                                <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                                    {t('No stores found')}
                                                </div>
                                            );
                                        }

                                        return results.map((store) => {
                                            const storeId = store._id || store.id;
                                            const isOpen = isStoreOpen(store);

                                            return (
                                                <div
                                                    key={storeId}
                                                    onClick={() => {
                                                        navigate(`/store/${storeId}`);
                                                        setSearchQuery('');
                                                    }}
                                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 text-left"
                                                >
                                                    <div className="relative flex-shrink-0">
                                                        <img
                                                            src={store.image || `${API_BASE_URL}/stores/${storeId}/image`}
                                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100?text=Store'; }}
                                                            alt={store.name}
                                                            className="w-10 h-10 rounded-lg object-cover border border-gray-100 dark:border-gray-700"
                                                        />
                                                        {/* Status Badge (Ultra-Compact) */}
                                                        <div className={`absolute bottom-0 right-0 ${isOpen ? 'bg-green-500' : 'bg-red-500'} px-1 py-0 rounded-tl-sm z-10 pointer-events-none shadow-sm border-l border-t border-white/20 h-2.5 flex items-center`}>
                                                            <span className="text-[6px] font-bold text-white leading-none">
                                                                {isOpen ? t('Open') : t('Closed')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                            {(() => {
                                                                const fullTitle = t(store, 'name');
                                                                const bracketIndex = fullTitle.indexOf('(');
                                                                if (bracketIndex !== -1) {
                                                                    const mainPart = fullTitle.substring(0, bracketIndex);
                                                                    const bracketPart = fullTitle.substring(bracketIndex);
                                                                    return (
                                                                        <>
                                                                            <span>{mainPart}</span>
                                                                            <span className="text-[10px] font-normal text-gray-500 dark:text-gray-400">{bracketPart}</span>
                                                                        </>
                                                                    );
                                                                }
                                                                return fullTitle;
                                                            })()}
                                                        </div>
                                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                                                            {t(store, 'address')}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            )}
                        </div>


                        {/* Category Pills */}
                        {isCategoriesLoading ? (
                            <div className="flex justify-start md:justify-center overflow-x-auto p-2 pb-2 scrollbar-hide -mx-2">
                                <div className="flex space-x-3 mx-auto px-2">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="flex-shrink-0 px-8 py-4 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse w-24"></div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-start md:justify-center overflow-x-auto p-2 pb-2 scrollbar-hide -mx-2">
                                <div className="flex space-x-3 mx-auto px-2">
                                    {categoryData.map((category) => {
                                        const isActive = category.name === categoryFilter;
                                        return (
                                            <button
                                                key={category.name}
                                                id={isActive ? "active-category-pill" : undefined}
                                                onClick={() => {
                                                    handleCategoryClick(category.name);
                                                    // Center the clicked button
                                                    document.getElementById("active-category-pill")?.scrollIntoView({
                                                        behavior: 'smooth',
                                                        block: 'nearest',
                                                        inline: 'center'
                                                    });
                                                }}
                                                className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isActive
                                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                                    : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
                                                    }`}
                                            >
                                                <span className="whitespace-nowrap">
                                                    {t(category.name)}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {isStoresLoading ? (
                        // Skeleton Loader
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse">
                                    <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                                    <div className="p-6 space-y-4">
                                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                        <div className="space-y-2">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                                        </div>
                                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredStores.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredStores.map((store) => (
                                <StoreCard key={store._id || store.id} store={store} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <Search className="text-gray-400 dark:text-gray-500" size={32} />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('No stores found')}</h3>
                            <p className="text-gray-500 dark:text-gray-400">{t('Try adjusting your search terms or category filter.')}</p>
                        </div>
                    )}
                </div>
            </div>
        </PullToRefreshLayout>
    );
};

export default Shop;
