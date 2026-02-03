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
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-6">{t('Find a Store')}</h1>
                        <div className="relative max-w-xl mb-6">
                            <input
                                type="text"
                                placeholder={t('Search by store name or location...')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-blue-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all focus:shadow-xl"
                            />
                            <Search className="absolute left-4 top-4 text-blue-500 dark:text-blue-400" size={22} />
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
                                        className={`flex-shrink-0 px-5 py-2.5 rounded-full border-2 transition-all duration-300 shadow-md hover:shadow-lg ${isActive
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-600 shadow-blue-300 dark:shadow-blue-900/50 scale-105'
                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:text-blue-500 hover:scale-105'
                                            }`}
                                    >
                                        <span className="font-bold whitespace-nowrap text-sm">
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
                                <div key={store._id || store.id} className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] overflow-hidden border border-gray-100 dark:border-gray-700 group flex flex-col">
                                    {/* Image Section - Reduced Height */}
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={store.image || `${API_BASE_URL}/stores/${store._id || store.id}/image`}
                                            alt={store.name}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500 ease-out"
                                            loading="lazy"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = "https://via.placeholder.com/400x300?text=Store";
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                                        {/* Status & Type Badges */}
                                        <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-2">
                                            {isStoreOpen(store) ? (
                                                <span className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[10px] uppercase font-bold tracking-wider rounded-full shadow-lg">
                                                    OPEN
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-600 text-white text-[10px] uppercase font-bold tracking-wider rounded-full shadow-lg">
                                                    CLOSED
                                                </span>
                                            )}
                                        </div>

                                        {/* Store Type Badge (Bottom Left of Image) */}
                                        {store.type && (
                                            <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-1">
                                                {Array.isArray(store.type) ? (
                                                    store.type.map((type, idx) => (
                                                        <span key={idx} className="px-3 py-1.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm text-gray-800 dark:text-white text-xs font-bold rounded-full shadow-lg">
                                                            {type}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="px-3 py-1.5 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm text-gray-800 dark:text-white text-xs font-bold rounded-full shadow-lg">
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
                                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-2.5 flex items-center gap-2 border border-blue-100 dark:border-blue-800">
                                                <Clock size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
                                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">
                                                    {store.timing || '9 - 9'}
                                                </span>
                                            </div>
                                            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-2.5 flex items-center gap-2 border border-purple-100 dark:border-purple-800">
                                                <Phone size={16} className="text-purple-600 dark:text-purple-400 shrink-0" />
                                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate">
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
