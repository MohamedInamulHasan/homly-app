import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { MapPin, Search, Star, Clock, Phone, Store } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';
import { isStoreOpen } from '../utils/storeHelpers';
import PullToRefreshLayout from '../components/PullToRefreshLayout';
import { API_BASE_URL } from '../utils/api';

const Shop = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchParams, setSearchParams] = useSearchParams();
    const { stores, categories: dbCategories, loading } = useData();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const categoryFilter = searchParams.get('category') || 'All';

    // Create categories array with "All" option first, then add categories from database
    const categories = [
        { name: 'All' },
        ...(dbCategories || []).map(cat => ({ name: cat.name }))
    ];

    // Non-blocking load: logic handled in return

    // Safety check for stores array to prevent crash if undefined (though DataContext should init it)
    const safeStores = stores || [];

    const filteredStores = safeStores.filter(store => {
        const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (store.address && store.address.toLowerCase().includes(searchQuery.toLowerCase()));

        // Flexible matching for category/type (Handle Array or String)
        const matchesCategory = categoryFilter === 'All' ||
            (Array.isArray(store.type)
                ? store.type.some(t => t.toLowerCase() === categoryFilter.toLowerCase())
                : store.type && store.type.toLowerCase() === categoryFilter.toLowerCase());

        return matchesSearch && matchesCategory;
    });

    const handleCategoryClick = (categoryName) => {
        setSearchParams({ category: categoryName });
    };

    return (
        <PullToRefreshLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('Find a Store')}</h1>
                        <div className="relative max-w-xl mb-6">
                            <input
                                type="text"
                                placeholder={t('Search by store name or location...')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                            />
                            <Search className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500" size={20} />
                        </div>

                        {/* Toggle and Count */}
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t('Showing')} <span className="font-semibold text-gray-900 dark:text-white">{filteredStores.length}</span> {t('stores')}
                            </p>
                        </div>

                        {/* Category Pills */}
                        <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                            {categories.map((category) => {
                                const isActive = category.name === categoryFilter;
                                return (
                                    <button
                                        key={category.name}
                                        onClick={() => handleCategoryClick(category.name)}
                                        className={`flex-shrink-0 px-4 py-2 rounded-full border transition-all duration-300 ${isActive
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:text-blue-500'
                                            }`}
                                    >
                                        <span className="font-medium whitespace-nowrap text-sm">
                                            {t(category.name)}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {loading?.stores ? (
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredStores.map((store) => (
                                <div key={store._id || store.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100 dark:border-gray-700 group flex flex-col">
                                    {/* Image Section - Reduced Height */}
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={store.image || `${API_BASE_URL}/stores/${store._id || store.id}/image`}
                                            alt={store.name}
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
                                            loading="lazy"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://via.placeholder.com/400x300?text=Store";
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                                        {/* Status & Type Badges */}
                                        <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-2">
                                            {isStoreOpen(store) ? (
                                                <span className="px-2.5 py-1 bg-green-500 text-white text-[10px] uppercase font-bold tracking-wider rounded-md shadow-sm">
                                                    OPEN
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 bg-red-500 text-white text-[10px] uppercase font-bold tracking-wider rounded-md shadow-sm">
                                                    CLOSED
                                                </span>
                                            )}
                                        </div>

                                        {/* Store Type Badge (Bottom Left of Image) */}
                                        {store.type && (
                                            <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-1">
                                                {Array.isArray(store.type) ? (
                                                    store.type.map((type, idx) => (
                                                        <span key={idx} className="px-2.5 py-1 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm text-gray-800 dark:text-white text-xs font-semibold rounded-lg shadow-sm">
                                                            {type}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="px-2.5 py-1 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm text-gray-800 dark:text-white text-xs font-semibold rounded-lg shadow-sm">
                                                        {store.type}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Section - Compact Layout */}
                                    <div className="p-5 flex flex-col gap-4">
                                        {/* Header: Name and Address */}
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight mb-1 truncate">
                                                {t(store, 'name')}
                                            </h2>
                                            <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                                                <MapPin size={14} className="mr-1 flex-shrink-0" />
                                                <span className="truncate">{store.address || t('No address')}</span>
                                            </div>
                                        </div>

                                        {/* Info Grid: Time and Phone */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 flex items-center gap-2">
                                                <Clock size={14} className="text-blue-500 shrink-0" />
                                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                                                    {store.timing || '9 - 9'}
                                                </span>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 flex items-center gap-2">
                                                <Phone size={14} className="text-purple-500 shrink-0" />
                                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                                                    {store.mobile}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Button - No Gap */}
                                        <button
                                            onClick={() => {
                                                if (isStoreOpen(store)) {
                                                    navigate(`/store/${store._id || store.id}`);
                                                } else {
                                                    alert(t('This store is currently closed.'));
                                                }
                                            }}
                                            className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${isStoreOpen(store)
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg active:scale-95'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-200 dark:border-gray-600'
                                                }`}
                                        >
                                            {isStoreOpen(store) ? (
                                                <>
                                                    <span>{t('Visit Store')}</span>
                                                    <Store size={16} />
                                                </>
                                            ) : (
                                                t('Currently Closed')
                                            )}
                                        </button>
                                    </div>
                                </div>
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
