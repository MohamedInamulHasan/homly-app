import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { MapPin, Search, Star, Clock, Phone, Store, Wrench, ArrowRight } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { isStoreOpen, formatTime12h } from '../utils/storeHelpers';
import PullToRefreshLayout from '../components/PullToRefreshLayout';
import StoreCard from '../components/StoreCard';
import { API_BASE_URL } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useServices } from '../hooks/queries/useServices';
import HomeHeader from '../components/home/HomeHeader';

const Shop = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [viewType, setViewType] = useState('store'); // 'store' or 'service'
    const [searchParams, setSearchParams] = useSearchParams();
    const { stores, categories: dbCategories, loading, initialLoading } = useData();
    const { data: services = [], isLoading: servicesLoading } = useServices();
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
            <div className="min-h-screen bg-[#E8EAEF] dark:bg-gray-900 pb-24 transition-colors duration-200">
                <div className="w-full bg-[#CBF9B2] rounded-b-[2.5rem] px-2 pt-4 pb-5 shadow-sm relative overflow-hidden mb-4">
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/30 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="relative z-10">
                        <HomeHeader />
                    </div>
                </div>
                
                <div className="max-w-7xl mx-auto px-4 mt-2">
                    <div className="mb-2">
                        {/* Removed Store/Service toggle for a cleaner experience */}
                        <div className="relative group mb-8">
                            <input
                                type="text"
                                placeholder={t('Search by store name or location...')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-6 py-4 rounded-full border border-gray-100 bg-white text-gray-900 placeholder-gray-400 focus:outline-none transition-all duration-300"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#2E5A2E] transition-colors" size={20} />

                            {/* Search Results Dropdown */}
                            {searchQuery.trim() && viewType === 'store' && (
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

                            {/* Service Search Results Dropdown */}
                            {searchQuery.trim() && viewType === 'service' && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-80 overflow-y-auto z-50 w-full overflow-x-hidden">
                                    {(() => {
                                        const q = searchQuery.toLowerCase();
                                        const results = services.filter(service =>
                                            service.name?.toLowerCase().includes(q) ||
                                            service.category?.toLowerCase().includes(q)
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
                                                    {t('No services found')}
                                                </div>
                                            );
                                        }

                                        return results.map((service) => {
                                            const serviceId = service._id || service.id;

                                            return (
                                                <div
                                                    key={serviceId}
                                                    onClick={() => {
                                                        navigate(`/services?id=${serviceId}`);
                                                        setSearchQuery('');
                                                    }}
                                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 text-left"
                                                >
                                                    <div className="relative flex-shrink-0">
                                                        <img
                                                            src={service.image || `${API_BASE_URL}/services/${serviceId}/image`}
                                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100?text=Service'; }}
                                                            alt={service.name}
                                                            className="w-10 h-10 rounded-lg object-cover border border-gray-100 dark:border-gray-700"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                            {(() => {
                                                                const fullTitle = t(service, 'name');
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
                                                            {service.category || t('Service')}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            )}
                        </div>


                        {/* Category Tabs - Only show for stores */}
                        {viewType === 'store' && (
                            isCategoriesLoading ? (
                                <div className="max-w-7xl mx-auto mb-6">
                                    <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide border-b border-gray-100/50 pb-2">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div key={i} className="flex-shrink-0 bg-gray-200 dark:bg-gray-700 animate-pulse w-16 h-4 rounded"></div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="max-w-7xl mx-auto mb-6 mt-2">
                                    <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide border-b border-gray-100/50">
                                        {categoryData.map((category) => {
                                            const isActive = category.name === categoryFilter;
                                            return (
                                                <button
                                                    key={category.name}
                                                    id={isActive ? "active-category-pill" : undefined}
                                                    onClick={() => {
                                                        handleCategoryClick(category.name);
                                                        document.getElementById("active-category-pill")?.scrollIntoView({
                                                            behavior: 'smooth',
                                                            block: 'nearest',
                                                            inline: 'center'
                                                        });
                                                    }}
                                                    className={`pb-3 text-sm font-bold transition-all relative whitespace-nowrap uppercase tracking-wide ${isActive
                                                        ? 'text-[#2E5A2E]'
                                                        : 'text-gray-400 hover:text-gray-600'
                                                        }`}
                                                >
                                                    {t(category.name)}
                                                    {isActive && (
                                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2E5A2E] rounded-full"></div>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )
                        )}
                    </div>
 
                    <AnimatePresence mode="wait">
                        {viewType === 'store' ? (
                            <motion.div
                                key="stores"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {isStoresLoading ? (
                                    // Skeleton Loader
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                                        {[1, 2, 3, 4, 5, 6].map((i) => (
                                            <div key={i} className="bg-white dark:bg-gray-800 rounded-[2rem] h-80 shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden animate-pulse" />
                                        ))}
                                    </div>
                                ) : filteredStores.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                            </motion.div>
                        ) : (
                            <motion.div
                                key="services"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {servicesLoading ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                                        {[1, 2, 3, 4, 5, 6].map((i) => (
                                            <div key={i} className="bg-white dark:bg-gray-800 rounded-[2rem] h-80 shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden animate-pulse" />
                                        ))}
                                    </div>
                                ) : (() => {
                                    const filteredServices = services.filter(service =>
                                        service.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        service.category?.toLowerCase().includes(searchQuery.toLowerCase())
                                    );
 
                                    if (filteredServices.length === 0) {
                                        return (
                                            <div className="text-center py-12">
                                                <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                                    <Store className="text-gray-400 dark:text-gray-500" size={32} />
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('No services found')}</h3>
                                                <p className="text-gray-500 dark:text-gray-400">{t('Try searching for something else.')}</p>
                                            </div>
                                        );
                                    }
 
                                    return (
                                        <div className="grid grid-cols-1 gap-4">
                                            {filteredServices.map((service, index) => (
                                                <div
                                                    key={service._id || index}
                                                    onClick={() => navigate(`/services?id=${service._id || service.id}`)}
                                                    className="group flex items-center gap-4 bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700/50 cursor-pointer"
                                                >
                                                    {/* Left Side: Square Image */}
                                                    <div className="w-20 h-20 flex-shrink-0 relative">
                                                        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                                                        <img
                                                            src={service.image || `${API_BASE_URL}/services/${service._id || service.id}/image`}
                                                            alt={service.name}
                                                            className="absolute inset-0 w-full h-full object-cover rounded-xl z-10"
                                                            onError={(e) => { e.target.src = 'https://placehold.co/200x200?text=Service'; }}
                                                        />
                                                    </div>

                                                    {/* Middle: Details */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1.5 mb-1">
                                                            <span className="px-1.5 py-0.5 bg-[#CBF9B2]/20 rounded text-[9px] font-bold text-[#2E5A2E] dark:text-[#CBF9B2] uppercase tracking-wider">
                                                                {service.category || t('Service')}
                                                            </span>
                                                        </div>
                                                        <h3 className="text-gray-900 dark:text-white text-[15px] font-semibold truncate mb-1">
                                                            {service.name}
                                                        </h3>
                                                        <div className="flex items-center gap-1 opacity-60">
                                                            <MapPin size={12} className="text-[#2E5A2E] dark:text-[#CBF9B2]" />
                                                            <p className="text-gray-600 dark:text-gray-400 text-[11px] truncate">
                                                                {service.address || t('Available Locally')}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Right Side: Simple Arrow Icon */}
                                                    <div className="flex-shrink-0 pr-1">
                                                        <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400 group-hover:text-[#2E5A2E] dark:group-hover:text-[#CBF9B2] transition-colors">
                                                            <ArrowRight size={16} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </PullToRefreshLayout>
    );
};

export default Shop;
